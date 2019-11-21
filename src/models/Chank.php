<?php

namespace mrlinqu\fileupload\models;

use yii\base\Model;
use yii\helpers\Html;
use yii\web\UploadedFile;
use mrlinqu\fileupload\File;

class Chank extends Model
{
    public $data;
    public $id;
    public $name;
    public $extension;
    public $type;
    public $filesize;
    public $index;
    public $count;

    public function rules()
    {
        return [
            [['id', 'name', 'extension', 'type',], 'string', 'max' => 255],
            [['filesize', 'index', 'count'], 'integer'],
            [['data'], 'file', 'skipOnEmpty' => false],
        ];
    }

    public function load($data, $formName = null)
    {
        if (!parent::load($data, $formName)) {
            return false;
        }

        $this->data = UploadedFile::getInstanceByName('data');

        return true;
    }

    public function upload()
    {
        $uploadDir = \Yii::getAlias('@uploads/' . $this->id . '.tmp');
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
            throw new \Exception('Can\'t create temp directory');
        }

        $this->data->saveAs($uploadDir.'/'.$this->index);

        $fi = new \FilesystemIterator($uploadDir, \FilesystemIterator::SKIP_DOTS);
        $fCount = iterator_count($fi);
        if($fCount >= $this->count) {
            $newName = hash('sha256', $this->name . microtime()) . '.' . $this->extension;
            $target = \Yii::getAlias('@uploads/' . $newName);
            $dst = fopen($target, 'wb');
            for($i = 0; $i < $this->count; $i++) {
                $slice = $uploadDir .'/'. $i;
                $src = fopen($slice, 'rb');
                stream_copy_to_stream($src, $dst);
                fclose($src);
                unlink($slice);
            }
            rmdir($uploadDir);

            $f = new File(['filename'=>$newName]);
            return $f;
        }

        return null;
    }
}