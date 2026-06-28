<?php

$envPath = __DIR__ . '/../.env';
$env = parse_ini_file($envPath);

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$db   = $env['DB_DATABASE'] ?? 'devfolio';
$user = $env['DB_USERNAME'] ?? 'root';
$pass = $env['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$db}", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Check if column exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `educations` LIKE 'type'");
    $stmt->execute();
    $column = $stmt->fetch();

    if (!$column) {
        $pdo->exec("ALTER TABLE `educations` ADD COLUMN `type` VARCHAR(100) NULL DEFAULT 'Education' AFTER `id`");
        echo "SUCCESS: Added 'type' column to educations table via PDO!\n";
    } else {
        echo "ALREADY_EXISTS: 'type' column already exists in educations table.\n";
    }

    // Modify university, location, duration, grade, description to be NULLABLE
    $pdo->exec("ALTER TABLE `educations` MODIFY `university` VARCHAR(255) NULL");
    $pdo->exec("ALTER TABLE `educations` MODIFY `location` VARCHAR(255) NULL");
    $pdo->exec("ALTER TABLE `educations` MODIFY `duration` VARCHAR(255) NULL");
    $pdo->exec("ALTER TABLE `educations` MODIFY `grade` VARCHAR(50) NULL");
    $pdo->exec("ALTER TABLE `educations` MODIFY `description` TEXT NULL");
    echo "SUCCESS: Updated columns to be NULLABLE!";

} catch (Exception $e) {
    echo "PDO_ERROR: " . $e->getMessage();
}
