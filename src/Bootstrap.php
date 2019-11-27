<?php

namespace mrlinqu\fileupload;

use Yii;
use yii\base\BootstrapInterface;

class Bootstrap implements BootstrapInterface
{
    public function bootstrap($app)
    {
        $app->getUrlManager()->addRules([
            'fileupload/<action>' => 'fileupload/main/<action>',
            'fileuploads/<action>' => 'fileupload/main/<action>',
        ], false);

        if (!$app->hasModule('fileupload')) {
            $app->setModule('fileupload', 'mrlinqu\fileupload\Module');
        }
    }
}
