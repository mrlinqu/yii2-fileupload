<?php

namespace mrlinqu\fileupload;

class Module extends \yii\base\Module
{
    public $controllerNamespace = 'mrlinqu\fileupload\controllers';
    public $onUpload;
}