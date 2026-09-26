<?php
/**
 * db-config.php — Database Configuration & SQL Connection
 * Pink Oaks Luxury Residences
 *
 * Supports MySQL / MariaDB (standard SQL for production hosting)
 * with graceful SQLite fallback for local zero-config testing.
 */

// -------------------------------------------------------------------------
// DATABASE SETTINGS
// -------------------------------------------------------------------------
// Choose 'mysql' for live hosting (cPanel, phpMyAdmin, AWS, Hostinger, etc.)
// Choose 'sqlite' for local development or self-contained file database.
// -------------------------------------------------------------------------

if (!defined('DB_TYPE')) {
    define('DB_TYPE', 'mysql'); // 'mysql' or 'sqlite'
}

// MySQL / MariaDB Connection Parameters:
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_PORT')) define('DB_PORT', '3306');
if (!defined('DB_NAME')) define('DB_NAME', 'pinkoaks_db');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

// SQLite fallback file path:
if (!defined('DB_SQLITE_FILE')) define('DB_SQLITE_FILE', __DIR__ . '/database.sqlite');

/**
 * Returns an active PDO instance configured for MySQL or SQLite.
 * If MySQL fails to connect (e.g. locally before credentials are setup),
 * it seamlessly falls back to SQLite so no leads are ever dropped.
 *
 * @return array ['pdo' => PDO|null, 'type' => string, 'error' => string|null]
 */
function getDatabaseConnection() {
    static $connection = null;
    if ($connection !== null) {
        return $connection;
    }

    $pdo = null;
    $type = 'none';
    $err = null;

    if (DB_TYPE === 'mysql') {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $type = 'mysql';

            // Ensure table exists in MySQL database
            $pdo->exec("CREATE TABLE IF NOT EXISTS `leads` (
                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `submitted_at` VARCHAR(40) NOT NULL,
                `name` VARCHAR(120) NOT NULL,
                `email` VARCHAR(180) NOT NULL,
                `phone` VARCHAR(40) NOT NULL,
                `unit` VARCHAR(120) DEFAULT NULL,
                `message` TEXT DEFAULT NULL,
                `page_url` VARCHAR(500) DEFAULT NULL,
                `utm_source` VARCHAR(80) DEFAULT NULL,
                `utm_campaign` VARCHAR(80) DEFAULT NULL,
                `ip` VARCHAR(60) DEFAULT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_submitted_at (`submitted_at`),
                INDEX idx_phone (`phone`),
                INDEX idx_email (`email`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        } catch (Exception $e) {
            $err = $e->getMessage();
            error_log('MySQL connection failed (' . $err . '). Falling back to SQLite.');
            $pdo = null;
        }
    }

    // Fallback or explicit SQLite mode
    if (!$pdo) {
        try {
            $pdo = new PDO('sqlite:' . DB_SQLITE_FILE);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec("CREATE TABLE IF NOT EXISTS leads (
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
                ip TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            $type = 'sqlite';
        } catch (Exception $e) {
            error_log('SQLite database error: ' . $e->getMessage());
            $pdo = null;
            $type = 'none';
        }
    }

    $connection = ['pdo' => $pdo, 'type' => $type, 'error' => $err];
    return $connection;
}
