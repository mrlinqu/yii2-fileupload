<?php

namespace mrlinqu\fileupload\controllers;

use Yii;
use yii\helpers\Json;
use yii\rest\Controller;
use mrlinqu\fileupload\models\Chank;
use mrlinqu\fileupload\File;

class MainController extends Controller
{
    public function actionUpload()
    {
        $model = new Chank();

        if (!$model->load(Yii::$app->request->post(), '')) {
            throw new \Exception('Bad request');
        }

        if (!$model->validate()) {
            throw new \Exception('Bad params');
        }

        if ($f = $model->upload()){
            if ($this->module->onUpload && is_callable($this->module->onUpload)) {
                $func = $this->module->onUpload;
                call_user_func($func, $f->filename);
            }
            return $f->getInfo();
        }

        return '';
    }

    public function actionThumb($file)
    {
        $f = new File(['filename'=>$file]);
        if ($url = $f->showThumb()) {
            $this->redirect($url);
        }
    }

    public function actionInfo($file)
    {
        $f = new File(['filename'=>$file]);
        return $f->getInfo();
    }

    public function actionImage($file)
    {
        $f = new File(['filename'=>$file]);
        if ($url = $f->asImage()) {
            $this->redirect($url);
        }
    }
}
