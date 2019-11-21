;(function ( $, window, document, undefined ) {

    "use strict";

    let randomId = (function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return function(words) {
            var words = words || 8,
                ret = '';
            for(var i = 0; i < words; i++){
                ret += s4();
            }
            return ret;
        };
    })();

    let ChankObj = function (options)
    {
        var defaults = {
            url: '',
            file: null,
            data: null,
            id: '',
            name: '',
            extension: '',
            type: '',
            filesize: '',
            index: 0,
            count: 0,
            extraData: {},
            errorRepeats: 3
        };
        this.options = $.extend( {}, defaults, options);

        this.errorCount = 0;
        this.status = '';
        this.loaded = 0;
        this.total = 0;
        this.response = '';
        this.xhr = new XMLHttpRequest();
        //this.options.file.chanks[this.options.index] = this;

        this.onLoad = this.options.onLoad || function(e){};
        this.onError = this.options.onError || function(e){};
        this.onProgress = this.options.onProgress || function(e){};

        this.send = send.bind(this);
        this.abort = abort.bind(this);

        function abort()
        {
            if (this.status == 'progress') {
                this.xhr.abort();
                this.status = '';
            }
        }

        function send()
        {
            let fd = new FormData();

            fd.append("data", this.options.data);
            fd.append("id", this.options.id);
            fd.append("name", this.options.name);
            fd.append("extension", this.options.extension);
            fd.append("type", this.options.type);
            fd.append("filesize", this.options.filesize);
            fd.append("index", this.options.index);
            fd.append("count", this.options.count);
            for (let varible in this.options.extraData) {
                fd.append(varible, this.options.extraData[varible]);
            }

            this.xhr.open("POST", this.options.url, true);
            //this.xhr.responseType = "json";
            this.xhr.onreadystatechange = _onreadystatechange.bind(this);
            this.xhr.upload.onprogress = _onprogress.bind(this);
            this.xhr.send(fd);
            this.status = 'progress';
        }

        function _onreadystatechange(e)
        {
            if (this.xhr.readyState != 4) {
                return;
            }
            if (this.xhr.status != 200) {
                this.errorCount++;
                if (this.errorCount >= this.options.errorRepeats) {
                    if (this.xhr.responseText) {
                        this.response = this.xhr.responseText;//$.parseJSON(this.xhr.responseText);
                    }
                    this.status = 'error';
                    this.onError(this);
                } else {
                    this.send();
                }
                return;
            }
            if (this.xhr.responseText) {
                this.response = $.parseJSON(this.xhr.responseText);
            }
            this.status = 'done';
            this.onLoad(this);
        }

        function _onprogress(e)
        {
            this.loaded = e.loaded;
            this.total = e.total;
            this.onProgress(this);
        }
    };

    let FileObj = function (options)
    {
        var defaults = {
            name: '',
            file: null,
            chunkSize: null,
            extraData: {}
        };
        this.options = $.extend( {}, defaults, options);

        this.error = false;
        this.loaded = false;
        this.progress = 0;
        this.nameOnServer = '';
        this.status = '';
        this.chanks = [];
        this.id = null;
        this._card = null;

        this.send = send.bind(this);
        this.showError = showError.bind(this);
        this.updateInfo = updateInfo.bind(this);

        init.call(this);

        function init()
        {
            this._card = $('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12" style="min-width: 279px;"><div class="fileUpload-file thumbnail"><img class="fileUpload-image"><div class="caption"></div></div></div>');
            this._card_image = $('.fileUpload-image', this._card);
            this._card_btn_del = $('<button type="button" class="btn btn-primary">Удалить</button>');
            this._card_caption = $('.caption', this._card)
                .append($('<div class="fileUpload-progress progress"><div class="fileUpload-progress-bar progress-bar"></div></div><p class="fileUpload-size"></p><p class="fileUpload-date"></p>'))
                .append(this._card_btn_del.on('click', _onDelete.bind(this)))
            ;

            this._card_progressBar = $('.fileUpload-progress-bar', this._card_caption);
            this._card_size = $('.fileUpload-size', this._card_caption);
            this._card_date = $('.fileUpload-date', this._card_caption);
            this.options.plugin._dropzone.append(this._card);

            if (this.options.name) {
                this.updateInfo();
            }
        }


        function send()
        {
            this.id = randomId();
            let options = {
                url: this.options.url,
                file: this,
                id: this.id,
                name: this.options.file.name,
                extension: this.options.file.name.split('.').pop().toLowerCase(),
                filesize: this.options.file.size,
                type: this.options.file.type,
                count: Math.ceil(this.options.file.size / this.options.chunkSize),
                extraData: this.options.extraData
            };

            let pos = 0,
                indx = 0;
            while(pos < this.options.file.size){
                let end = pos + this.options.chunkSize; //file.size;
                if (!this.options.chunkSize || end > this.options.file.size) {
                    end = this.options.file.size;
                }

                options.index = indx;
                options.data = this.options.file.slice(pos, end);

                pos = end;

                var ch = new ChankObj(options);
                ch.onLoad = _onChankLoad.bind(this);
                ch.onError = _onChankError.bind(this);
                ch.onProgress = _onChankProgress.bind(this);
                this.chanks.push(ch);

                indx++;
                ch.send();
            }
        }

        function showError(text)
        {
            this._card_image.addClass('error');
            this._card_caption
                .html('<div class="alert alert-danger">' + text + '</div>')
                .append(this._card_btn_del.on('click', _onDelete.bind(this)));
        }

        function _onDelete()
        {
            for (let i in this.chanks) {
                this.chanks[i].abort();
            }
            this.chanks = [];
            this._card.remove();

            let files = this.options.plugin._files;
            files.splice(files.indexOf(this), 1);

            this.options.plugin.updateInput();

            return false;
        }

        function _onChankLoad(chank)
        {
            if (chank.response) { // ответ от сервера будет только после получения последней части файла
                this.options.name = chank.response.name;
                this.status = 'done';

                this.updateInfo(chank.response);
                this.options.plugin.updateInput();
            }
        }

        function _onChankError(chank)
        {
            this.status = 'error';
            for (let i in this.chanks) {
                this.chanks[i].abort();
            }

            this.showError('Ошибка загрузки');
        }

        function _onChankProgress(chank)
        {
            this.loaded = 0;
            for (let i in this.chanks) {
                this.loaded += this.chanks[i].loaded;
            }
            this.progress = this.loaded / this.options.file.size;
            this._card_progressBar.css('width', this.progress*100+'%');
        }

        async function updateInfo(data)
        {
            if (!data || !data.thumb) {
                let response = await fetch('/fileupload/info?file=' + this.options.name);
                if (!response.ok){
                    if (response.status == 404) {
                        this.showError('Файл не найден');
                    } else {
                        this.showError('Ошибка получения информации о файле');
                    }
                    return;
                }
                data = await response.json();
            }

            this._card_image.attr('src', data.thumb);
            this._card_size.text(data.size);
            this._card_date.text(data.date);
        }
    };

    var pluginName = 'fileUpload',
        defaults = {
            url: '',
            multiple: true,
            chunkSize: 1*1024*1024,
            extraData: {}
        };

    function Plugin(element, options) {
        this.inputElement = $(element);
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._files = [];
        this._dropzone = null;
        this._fileField = null;

        this.send = send.bind(this);
        this.updateInput = updateInput.bind(this);

        init.call(this);
    }

    function init()
    {
        this._dropzone = $('<div class="fileUpload-dropzone row"><div class="fileUpload-text">Click or drop files here to upload</div></div>')
            .on('dragenter', function(e){e.preventDefault();e.stopPropagation();})
            .on('dragover', function(e){e.preventDefault();e.stopPropagation();})
            .on('drop', _onDrop.bind(this))
            .on('click', _onClick.bind(this))
            .insertAfter(this.inputElement);

        this._fileField = $('<input type="file">')
            .on('change', _onFileSelect.bind(this));

        if(this.options.multiple){
            this._fileField.attr('multiple', '');
        }

        let val = this.inputElement.val();

        if (val) {
            var filenames = val.split(',');
            for (let i in filenames) {
                let f = new FileObj({
                    plugin: this,
                    name: filenames[i],
                    url: this.options.url,
                    extraData: this.options.extraData
                });
                this._files.push(f);
            }
        }
    }

    function _onDrop(e)
    {
        if(e.originalEvent.dataTransfer){
            if(e.originalEvent.dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                //this.beforeUpload(e.originalEvent.dataTransfer.files);
                this.send(e.originalEvent.dataTransfer.files);
            }
        }
    }

    function _onClick(e)
    {
        this._fileField.click();
    }

    function _onFileSelect(e)
    {
        if(e.target.files.length) {
            //this.beforeUpload(e.target.files);
            this.send(e.target.files);
        }
    }

    /*function beforeUpload(files)
    {
        if(this.options.ticketUrl){ // отправка на другой сервер: нужна авторизация, используем тикеты
            var self = this;
            $.get(
                this.options.ticketUrl,
                {},
                function(data, textStatus, jqXHR){
                    self._ticket = {server: data.server, ticket: data.ticket};
                    self.upload(files);
                },
                'json'
            );
        }else{
            this.upload(files);
        }
    }*/

    function send(files)
    {
        for (let i = 0; i < files.length; i++) {
            let f = new FileObj({
                plugin: this,
                url: this.options.url,
                chunkSize: this.options.chunkSize,
                extraData: this.options.extraData,
                file: files[i]
            });
            this._files.push(f);
            f.send();
        }
    }

    function updateInput()
    {
        let names = [];
        for (let i in this._files) {
            let f = this._files[i];
            if (f.options.name && f.options.name.length > 0) {
                names.push(f.options.name);
            }
        }
        this.inputElement.val(names.join());
    }

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };


})(jQuery, window, document);