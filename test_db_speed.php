<?php
$start = microtime(true);
$c = new PDO('mysql:host=127.0.0.1;dbname=devfolio', 'root', '');
$connTime = microtime(true) - $start;

$startQuery = microtime(true);
$rows = $c->query('SELECT * FROM social_links')->fetchAll(PDO::FETCH_ASSOC);
$queryTime = microtime(true) - $startQuery;

echo "Connection Time: " . round($connTime * 1000, 2) . " ms\n";
echo "Query Time: " . round($queryTime * 1000, 2) . " ms\n";
echo "Total Time: " . round((microtime(true) - $start) * 1000, 2) . " ms\n";
