<?php

namespace mrlinqu\fileupload;

use yii\web\AssetBundle;

class FileUploadAsset extends AssetBundle
{
    //public $basePath = '@webroot';
    //public $baseUrl = '@web';
    public $sourcePath = '@vendor/mrlinqu/fileupload/src/assets';
    public $css = [
        'fileUpload.css',
    ];
    public $js = [
        'fileUpload.js',
    ];
    public $depends = [
        'yii\bootstrap\BootstrapAsset',
        'yii\web\JqueryAsset',
    ];
}