<?php

namespace mrlinqu\fileupload;

use yii\helpers\Html;
use yii\helpers\Json;
use mrlinqu\fileupload\FileUploadAsset;

class FileUploadWidget extends \yii\widgets\InputWidget
{
    public function init()
    {
        parent::init();
        if (!isset($this->options['url'])) {
            $this->options['url'] = '/fileupload/upload';
        }
    }

    public function run()
    {
        echo $this->renderInputHtml('hidden');
        $this->registerPlugin();
    }

    protected function registerPlugin()
    {
        $view = $this->getView();

        FileUploadAsset::register($view);

        $id = $this->options['id'];
        $options = Json::htmlEncode($this->options);
        $js = "jQuery('#$id').fileUpload($options);";
        $view->registerJs($js);
    }
}
