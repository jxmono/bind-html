define(["github/adioo/bind/v0.2.0/bind", "github/adioo/events/v0.1.0/events", "/jquery.js"], function(Bind, Events) {

    function Html(module) {

        var self;
        var config;
        var template;

        function processConfig(config) {
            config.options = config.options || {};
            config.template.binds = config.template.binds || [];

            config.options.hidden = config.options.hidden || false;

            return config;
        }

        function init(conf) {

            // initialize the globals
            self = this;
            config = processConfig(conf);
            if (config.container) {
                container = $(config.container, module.dom);
            } else {
                container = $(module.dom);
            }
            template = $(config.template.value, module.dom);

            // run the binds
            for (var i in config.binds) {
                Bind.call(self, config.binds[i]);
            }

            Events.call(self, config);

            if (config.options.hidden) {
                self.hide();
            }
        }

        function render(item) {
            switch (config.template.type) {
                case "selector":
                    renderSelector.call(self, item);
                case "html":
                    // TODO
                case "url":
                    // TODO
            }
        }

        function renderSelector(item) {
            var newItem = $(template).clone();
            newItem.removeClass("template");
            container.html(newItem);

            for (var i in config.template.binds) {
                var bindObj = config.template.binds[i];
                bindObj.context = newItem;
                Bind.call(self, bindObj, item);
            }
        }

        function addHandlerOnEvent(handler, miid, eventName) {

            // if the handler is a module function name
            if (typeof handler === "string" && typeof self[handler] === "function") {
                self.on(eventName, miid, function(data) {
                    self[handler].call(self, data);
                });
                return;
            }

            // else it must be object
            if (handler instanceof Object) {
                // do we have a handlers array
                var handlers = handler.handlers;
                // TODO this will also process handlers as a string
                if (handlers.length) {
                    for (var i in handlers) {
                        var foo = handlers[i];
                        if (foo.name && typeof self[foo.name] === "function") {
                            (function(name) {
                                self.on(eventName, miid, function(data) {
                                    self[name].call(self, data);
                                });
                            })(foo.name);
                        }
                    }
                }

                return;
            }
        }

        // ********************************
        // Public functions ***************
        // ********************************

        function clear() {
            // TODO
        }

        function update(data) {
            clear();
            render.call(self, data);
        }

        function show() {
            $(self.dom).parent().show();
        }

        function hide() {
            $(self.dom).parent().hide();
        }

         return {
            init: init,
            update: update,
            show: show,
            hide: hide
        };
    }

    return function(module, config) {

        var html = new Html(module);
        for (var i in html) {
            html[i] = module[i] || html[i];
        }
        html = Object.extend(html, module);

        html.init(config);

        return html;
    }
});

