<?php

/*
 * This file is part of the Arnapou GWBBCode package.
 *
 * (c) Arnaud Buathier <arnaud@arnapou.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

header('Content-type: text/plain; charset=utf-8');

// right check
if (!is_writable(dirname(__FILE__))) {
    die('Error: current folder should be writable !');
}

// init
ini_set('memory_limit', '256M');
set_time_limit(0);
define('COMPILED_PATH', dirname(__FILE__) . '/compiled');
define('DATABASE_PATH', dirname(__FILE__) . '/database');

// images folder check
if (!is_dir(DATABASE_PATH)) {
    die('Error: cannot find database folder !');
}

// compiled folder check
if (!is_dir(COMPILED_PATH)) {
    echo "Creating compiled folder ...\n";
    mkdir(COMPILED_PATH, 0777);
}

// empty the compiled path folder
echo "Emptying compiled folder ...\n";
$files = glob(COMPILED_PATH . '/*');
if (is_array($files)) {
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

// load languages
$languageFolders = glob(DATABASE_PATH . '/*', GLOB_ONLYDIR);
if (!is_array($languageFolders) || empty($languageFolders)) {
    die('Error: cannot find language folders !');
}
$languages = [];
foreach ($languageFolders as $languageFolder) {
    $lang = basename($languageFolder);
    if (strlen($lang) == 2) {
        $languages[] = $lang;
    }
}
if (empty($languages)) {
    die('Error: cannot find language folders !');
}

// some usefull functions
function getJsonKeyPair($filename)
{
    if (!is_file(DATABASE_PATH . '/' . $filename)) {
        die('Error: cannot find "' . $filename . '" file !');
    }
    $fh = fopen(DATABASE_PATH . '/' . $filename, 'r');
    echo "Loading $filename ...\n";
    $data      = [];
    $skipFirst = true;
    while (!feof($fh)) {
        $row = fgetcsv($fh, 65536, ';', '"');
        if ($skipFirst) {
            $skipFirst = false;
            continue;
        }
        if (empty($row[0])) {
            continue;
        }
        $data[utf8_encode($row[0])] = utf8_encode($row[1]);
    }
    return json_encode($data);
}

function getJsonSkills($filename)
{
    if (!is_file(DATABASE_PATH . '/' . $filename)) {
        die('Error: cannot find "' . $filename . '" file !');
    }
    $fh = fopen(DATABASE_PATH . '/' . $filename, 'r');
    echo "Loading $filename ...\n";
    $data      = [];
    $skipFirst = true;
    while (!feof($fh)) {
        $cols = fgetcsv($fh, 65536, ';', '"');
        if ($skipFirst) {
            $skipFirst = false;
            continue;
        }
        if (empty($cols) || count($cols) != 17) {
            continue;
        }
        $caracs = [];
        if ($cols[10] !== '') $caracs['s'] = $cols[10];
        if ($cols[11] !== '') $caracs['x'] = $cols[11];
        if ($cols[12] !== '') $caracs['g'] = $cols[12];
        if ($cols[13] !== '') $caracs['e'] = $cols[13];
        if ($cols[14] !== '') $caracs['a'] = $cols[14];
        if ($cols[15] !== '') $caracs['c'] = t($cols[15]);
        if ($cols[16] !== '') $caracs['r'] = $cols[16];
        $row            = [
            'p' => utf8_encode($cols[1]),
            'e' => $cols[2] ? 1 : 0,
            'n' => utf8_encode($cols[3]),
            'd' => utf8_encode($cols[4]),
            't' => utf8_encode($cols[5]),
            'y' => utf8_encode($cols[6]),
            'c' => utf8_encode($cols[7]),
            'a' => utf8_encode($cols[8]),
            'b' => utf8_encode($cols[9]),
            'z' => $caracs,
        ];
        $data[$cols[0]] = $row;
    }
    return json_encode($data);
}

function t($s)
{
    $s = str_replace(',', '.', $s);
    if ($s == 0.25) $s = '&frac14;';
    if ($s == 0.5) $s = '&frac12;';
    if ($s == 0.75) $s = '&frac34;';
    return $s;
}

// process by language
foreach ($languages as $lang) {
    echo "Processing $lang ...\n";
    $js = "GWConfig.db.skills = " . getJsonSkills($lang . '/skills.csv') . ";\n";
    $js .= "GWConfig.db.search = " . getJsonKeyPair($lang . '/search.csv') . ";\n";
    $js .= "GWConfig.db.professions = " . getJsonKeyPair($lang . '/professions.csv') . ";\n";
    $js .= "GWConfig.db.professionnames = " . getJsonKeyPair($lang . '/professionnames.csv') . ";\n";
    $js .= "GWConfig.db.professionkeys = " . getJsonKeyPair($lang . '/professionkeys.csv') . ";\n";
    $js .= "GWConfig.db.attributes = " . getJsonKeyPair($lang . '/attributes.csv') . ";\n";

    echo "Writing $lang.js ...\n";
    file_put_contents(COMPILED_PATH . '/' . $lang . '.js', $js);
}