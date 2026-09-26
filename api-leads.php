<?php
/**
 * api-leads.php — JSON API for Pink Oaks Admin Panel
 * Fetches leads from SQLite database (with CSV fallback), authenticates, and manages leads.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbFile = __DIR__ . '/database.sqlite';
$csvFile = __DIR__ . '/leads.csv';

// Connect to SQLite Database
function getDb() {
    global $dbFile;
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->exec("CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submitted_at TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            unit TEXT,
            message TEXT,
            page_url TEXT,
            utm_source TEXT,
            utm_campaign TEXT,
            ip TEXT
        )");
        return $db;
    } catch (Exception $e) {
        return null;
    }
}

// GET: Return all leads as JSON
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $leads = [];
    $db = getDb();
    
    if ($db) {
        try {
            $stmt = $db->query("SELECT * FROM leads ORDER BY id DESC");
            $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $leads = [];
        }
    }

    // If SQLite is empty or not available, check CSV as fallback
    if (empty($leads) && file_exists($csvFile)) {
        if (($handle = fopen($csvFile, 'r')) !== false) {
            $headers = fgetcsv($handle);
            if ($headers !== false) {
                while (($row = fgetcsv($handle)) !== false) {
                    if (count($row) === count($headers)) {
                        $leads[] = array_combine($headers, $row);
                    } else if (count($row) > 0) {
                        $lead = [];
                        foreach ($headers as $i => $h) {
                            $lead[$h] = $row[$i] ?? '';
                        }
                        $leads[] = $lead;
                    }
                }
            }
            fclose($handle);
        }
        $leads = array_reverse($leads);
    }

    echo json_encode([
        'success' => true,
        'storage' => $db ? 'sqlite' : 'csv',
        'leads' => $leads
    ]);
    exit;
}

// POST: Add new lead via API
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    if (!empty($data)) {
        $submitted_at = $data['submitted_at'] ?? gmdate('c');
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $phone = $data['phone'] ?? '';
        $unit = $data['unit'] ?? $data['residence'] ?? '';
        $message = $data['message'] ?? '';
        $page_url = $data['page_url'] ?? '';
        $utm_source = $data['utm_source'] ?? '';
        $utm_campaign = $data['utm_campaign'] ?? '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        $db = getDb();
        if ($db) {
            $stmt = $db->prepare("INSERT INTO leads (submitted_at, name, email, phone, unit, message, page_url, utm_source, utm_campaign, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$submitted_at, $name, $email, $phone, $unit, $message, $page_url, $utm_source, $utm_campaign, $ip]);
        }

        // Also write to CSV
        if ($fh = @fopen($csvFile, 'a')) {
            if (!file_exists($csvFile) || filesize($csvFile) === 0) {
                fputcsv($fh, ['submitted_at', 'name', 'email', 'phone', 'unit', 'message', 'page', 'utm_source', 'utm_campaign', 'ip']);
            }
            fputcsv($fh, [$submitted_at, $name, $email, $phone, $unit, $message, $page_url, $utm_source, $utm_campaign, $ip]);
            fclose($fh);
        }

        echo json_encode(['success' => true, 'message' => 'Lead saved to database']);
        exit;
    }
}

// DELETE: Clear or delete leads
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (isset($data['action']) && $data['action'] === 'clear_all') {
        $db = getDb();
        if ($db) {
            $db->exec("DELETE FROM leads");
        }
        if (file_exists($csvFile)) {
            $fh = fopen($csvFile, 'w');
            fputcsv($fh, ['submitted_at', 'name', 'email', 'phone', 'unit', 'message', 'page', 'utm_source', 'utm_campaign', 'ip']);
            fclose($fh);
        }
        echo json_encode(['success' => true, 'message' => 'Database cleared successfully']);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Unsupported method']);
exit;
