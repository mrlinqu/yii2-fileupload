<?php

namespace mrlinqu\fileupload;

use Imagine\Image\ManipulatorInterface;
use yii\helpers\Url;
use yii\imagine\Image;

class File extends \yii\base\BaseObject
{
    public $filename;

    protected $fullFilename;

    public function init()
    {
        parent::init();

        if (!$this->filename) {
            throw new \Exception('Filename option required');
        }

        $this->fullFilename = \Yii::getAlias('@uploads/' . $this->filename);

        if (!is_file($this->fullFilename)) {
            throw new \Exception('File not found!');
        }
    }

    public function getInfo()
    {
        return [
            'name' => $this->filename,
            'thumb' => Url::to(['/fileupload/thumb', 'file'=>$this->filename]),
            'date' => date("c", filemtime($this->fullFilename)),
            'size' => filesize($this->fullFilename),
        ];
    }

    public function showThumb($limit=239)
    {
        $path_parts = pathinfo($this->fullFilename);
        if (!in_array($path_parts['extension'], ['jpg', 'png'])) {
            $assetsUrl = \Yii::$app->assetManager->getPublishedUrl('@vendor/mrlinqu/yii2-fileupload/src/assets');
            return $assetsUrl . '/file.png';
        }

        $format = 'png';
        //$format = 'jpeg';
        if (!is_file($this->fullFilename . '.thumb')) {
            Image::thumbnail($this->fullFilename, $limit, $limit, ManipulatorInterface::THUMBNAIL_INSET)->save($this->fullFilename . '.thumb', ['format'=>$format,'jpeg_quality' => 50]);
        }

        $fp = fopen($this->fullFilename . '.thumb', 'rb');
        header('Content-type: image/'.$format);
        fpassthru($fp);
        fclose($fp);

        /*$response = \Yii::$app->getResponse();
        $response->format = \yii\web\Response::FORMAT_RAW;
        $response->getHeaders()
            ->set('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + (7*24*60*60)))
            ->set('Cache-Control', 'public, max-age=604800')
            ->set('Content-Transfer-Encoding', 'binary')
            ->set('Content-type', 'image/'.$format);
        $response->data = file_get_contents($this->fullFilename . '.thumb');*/

        return null;
    }

    public function asImage()
    {
        $path_parts = pathinfo($this->fullFilename);
        if (!in_array($path_parts['extension'], ['jpg', 'png'])) {
            $assetsUrl = \Yii::$app->assetManager->getPublishedUrl('@vendor/mrlinqu/yii2-fileupload/src/assets');
            return $assetsUrl . '/file.png';
        }

        $mime_type = mime_content_type($this->fullFilename);
        $fp = fopen($this->fullFilename, 'rb');
        header('Content-type: '.$mime_type);
        fpassthru($fp);
        fclose($fp);

        return null;
    }
}