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

// GD check 
if (!extension_loaded('gd')) {
    die('Error: you must have GD extension activated !');
}

// right check
if (!is_writable(dirname(__FILE__))) {
    die('Error: current folder should be writable !');
}

// init
ini_set('memory_limit', '256M');
set_time_limit(0);
define('COMPILED_PATH', dirname(__FILE__) . '/compiled');
define('IMAGE_PATH', dirname(__FILE__) . '/images');
define('IMAGE_SIZE', 50);

// images folder check
if (!is_dir(IMAGE_PATH)) {
    die('Error: cannot find image folder !');
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

// load list of images
$images = glob(IMAGE_PATH . '/*.jpg');
if (!is_array($images) || empty($images)) {
    die('Error: the image folder should not be empty !');
}

// build sprites
$sprites = [];
foreach ($images as $image) {
    $k             = floor(basename($image, '.php') / 100);
    $sprites[$k][] = $image;
}
ksort($sprites);

// process sprites
$css = '';
foreach ($sprites as $k => $images) {
    echo "Building sprite #$k ...\n";
    $css       .= ".skillPack" . $k . "{background-image:url(skills_" . $k . ".jpg);}\n";
    $imgsprite = imagecreatetruecolor(10 * IMAGE_SIZE, ceil(count($images) / 10) * IMAGE_SIZE);
    $x         = 0;
    $y         = 0;
    foreach ($images as $filename) {
        $css      .= ".skill" . basename($filename, '.jpg') . "{background-position:" . (-$x) . "px " . (-$y) . "px;}\n";
        $imgskill = imagecreatefromjpeg($filename);
        imagecopy($imgsprite, $imgskill, $x, $y, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
        imagedestroy($imgskill);
        $x += IMAGE_SIZE;
        if ($x >= 10 * IMAGE_SIZE) {
            $x = 0;
            $y += IMAGE_SIZE;
        }
    }
    imagejpeg($imgsprite, COMPILED_PATH . '/skills_' . $k . '.jpg', 85);
    imagedestroy($imgsprite);
}

// write css
echo "Writing css ...\n";
file_put_contents(COMPILED_PATH . '/skills.css', $css);