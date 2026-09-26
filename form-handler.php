<?php
/**
 * form-handler.php — receives enquiries from assets/js/forms.js and emails them.
 *
 * ---------------------------------------------------------------------------
 * SET $TO BELOW BEFORE GOING LIVE. Until you do, this refuses every submission
 * rather than silently dropping leads.
 * ---------------------------------------------------------------------------
 *
 * Works on any PHP host (Hostinger, cPanel shared hosting). Upload it to the
 * same folder as index.html. No libraries, no account, no signup.
 *
 * It also appends every lead to leads.csv next to this file, so nothing is lost
 * even if the mail server has a bad day. Keep that file out of the web root if
 * you can, or add a deny rule for it.
 */

// ---------------------------------------------------------------- settings

$TO       = '';                       // <-- e.g. 'sales@pinkoaks.in'
$SUBJECT  = 'New enquiry — Pink Oaks website';
$FROM     = '';                       // optional; must be a domain you own.
                                      // Leave blank to use no-reply@<your-domain>
$LOG_CSV  = __DIR__ . '/leads.csv';   // set to '' to disable the CSV backup

// -------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');

function reply($ok, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(false, 'Method not allowed.', 405);
}

// accept JSON (what forms.js sends) or a normal form post
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}
if (!is_array($data) || !$data) {
    reply(false, 'Empty submission.', 400);
}

// spam trap — forms.js adds this hidden field; a human leaves it blank
if (!empty($data['po_website'])) {
    reply(true, 'Thank you.');            // look successful, send nothing
}

function clean($v, $max = 2000) {
    $v = is_string($v) ? $v : '';
    $v = str_replace(["\r", "\n", "\0"], ' ', trim($v));
    return mb_substr($v, 0, $max);
}

$name    = clean($data['name']    ?? '', 120);
$email   = clean($data['email']   ?? '', 180);
$phone   = clean($data['phone']   ?? '', 40);
$message = clean($data['message'] ?? '', 2000);
$unit    = clean($data['unit'] ?? $data['residence'] ?? $data['title'] ?? '', 120);

if (mb_strlen($name) < 2)                              reply(false, 'Please enter your name.', 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        reply(false, 'Please enter a valid email.', 422);
if (strlen(preg_replace('/\D/', '', $phone)) < 10)     reply(false, 'Please enter a valid phone number.', 422);

// ------------------------------------------------------------- metadata

$meta = [
    'Unit of interest' => $unit,
    'Page'             => clean($data['page_url']   ?? '', 300),
    'Page title'       => clean($data['page_title'] ?? '', 200),
    'Submitted'        => clean($data['submitted_at'] ?? gmdate('c'), 40),
    'utm_source'       => clean($data['utm_source']   ?? '', 80),
    'utm_medium'       => clean($data['utm_medium']   ?? '', 80),
    'utm_campaign'     => clean($data['utm_campaign'] ?? '', 80),
    'IP'               => clean($_SERVER['REMOTE_ADDR'] ?? '', 60),
];

// --------------------------------------------------------------- SQL Database backup (MySQL / MariaDB / SQLite)

require_once __DIR__ . '/db-config.php';
$dbInfo = getDatabaseConnection();
$db = $dbInfo['pdo'];

if ($db) {
    try {
        $stmt = $db->prepare("INSERT INTO leads (submitted_at, name, email, phone, unit, message, page_url, utm_source, utm_campaign, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $meta['Submitted'],
            $name,
            $email,
            $phone,
            $unit,
            $message,
            $meta['Page'],
            $meta['utm_source'],
            $meta['utm_campaign'],
            $meta['IP']
        ]);
    } catch (Exception $e) {
        error_log('SQL Database insert error: ' . $e->getMessage());
    }
}

// --------------------------------------------------------------- CSV backup

if ($LOG_CSV !== '') {
    $new = !file_exists($LOG_CSV);
    if ($fh = @fopen($LOG_CSV, 'a')) {
        if ($new) {
            fputcsv($fh, ['submitted_at', 'name', 'email', 'phone', 'unit', 'message', 'page', 'utm_source', 'utm_campaign', 'ip']);
        }
        fputcsv($fh, [
            $meta['Submitted'], $name, $email, $phone, $unit, $message,
            $meta['Page'], $meta['utm_source'], $meta['utm_campaign'], $meta['IP'],
        ]);
        fclose($fh);
    }
}

if ($TO === '') {
    // Lead is safely stored in database / leads.csv / admin panel.
    reply(true, 'Thank you. We will be in touch shortly.');
}

$lines = [
    'Name:    ' . $name,
    'Email:   ' . $email,
    'Phone:   ' . $phone,
    '',
    'Message:',
    ($message !== '' ? $message : '(none)'),
    '',
    str_repeat('-', 48),
];
foreach ($meta as $k => $v) {
    if ($v !== '') $lines[] = str_pad($k . ':', 18) . $v;
}
$body = implode("\n", $lines);

if ($FROM === '') {
    $host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
    $FROM = 'no-reply@' . $host;
}

$headers  = 'From: Pink Oaks Website <' . $FROM . ">\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";


// ------------------------------------------------------------------- send

$sent = @mail($TO, $SUBJECT . ' — ' . $name, $body, $headers);

if (!$sent) {
    // the lead is already in leads.csv, so report the failure honestly
    error_log('form-handler.php: mail() failed for ' . $email);
    reply(false, 'We could not send that just now. Please call +91 91169 65636.', 502);
}

reply(true, 'Thank you. We will be in touch within one business day.');
