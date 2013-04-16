define(["github/adioo/bind/v0.2.5/bind", "github/adioo/events/v0.1.2/events", "/jquery.js"], function(Bind, Events) {

    function Html(module) {

        var self;
        var config;
        var template;
        var container;

        function processConfig(config) {
            config.options = config.options || {};

            return config;
        }

        function init(conf) {

            // initialize the globals
            self = this;
            config = processConfig(conf);
            container = $(module.dom);
            template = container.children();
            template.remove();

            Events.call(self, config);
        }

        function render(item) {
            var newItem = template.clone();

            // run the binds
            for (var i in config.binds) {
                var bindObj = config.binds[i];
                bindObj.context = newItem;
                Bind.call(self, bindObj, item);
            }

            container.append(newItem);
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
            container.children().remove();
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

