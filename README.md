fileupload
=============
Yii2 extension for uploading files to the site.
Upload widget for form. Chunking files to small parts (for upload big files with small POST size).

Installation
------------

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist mrlinqu/yii2-fileupload "*"
```

or add

```
"mrlinqu/yii2-fileupload": "*"
```

to the require section of your `composer.json` file.


Usage
-----

Once the extension is installed, simply use it in your code by  :

```php
<?= \mrlinqu\fileupload\FileUploadWidget::widget(); ?>```