var moment = require('moment');

const tupasCreator = require('../../tupas');

exports.register = (server, options, next) => {

    var routes = [];

    // Serve static files (requires 'inert' plugin)
    routes.push({
        method: 'GET',
        path: '/images/{param*}',
        handler: {
            directory: {
                path: __dirname + '/../../public/images'
            }
        }
    }, {
        method: 'GET',
        path: '/app.css',
        handler: {
            file: __dirname + '/../css/app.css'
        }
    });

    // Create express-style app handler which creates hapi routes
    var appHandler = {
        post: (path, handler) => {
            routes.push({
                method: 'POST',
                path,
                handler,
            });
        },
        get: (path, handler) => {
            routes.push({
                method: 'GET',
                path,
                handler,
            });
        },
    };

    var globalOpts = {
        hostUrl: server.info.uri,
    };

    var tupas = tupasCreator.create(globalOpts);

    tupas.bindHandlers(appHandler);

    tupas.on('success', function (req, reply) {
        reply(`
            <html>
                <h1 id='success'>SUCCESS</h1>
                <p>Return params:</p>
                <pre>${JSON.stringify(req.query, null, 4)}</pre>
            </html>
        `);
    });

    tupas.on('mac-check-failed', function (req, reply) {
        reply(`
            <html>
                <h1 id='mac-check-failed'>MAC-CHECK-FAILED</h1>
                <p>Return params:</p>
                <pre>${JSON.stringify(req.query, null, 4)}</pre>
            </html>
        `);
    });

    tupas.on('cancel', function (req, reply) {
        reply(`
            <html>
                <h1 id='cancel'>CANCEL</h1>
            </html>
        `);
    });

    tupas.on('reject', function (req, reply) {
        reply(`
            <html>
                <h1 id='reject'>REJECT</h1>
            </html>
        `);
    });

    routes.push({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
            // requestId length should be 20 as per TUPAS spec, but seems that
            // shorter ones are accepted.
            const now = moment().format('YYYYMMDDhhmmss');
            const requestId = now + '123456';

            const bankForms = tupas.banks.map((bankId) => {
                return tupas.tupasButton(bankId, 'FI', requestId);
            });

            const html = `
                <html>
                    <head>
                        <link rel='stylesheet' type='text/css' href='app.css'>
                    </head>
                    <body>
                        <div class='tupas-buttons'>
                            ${bankForms.join('')}
                        </div>
                    </body>
                </html>
            `;

            return reply(html);
        },
    });

    server.route(routes);

    return next();
};

exports.register.attributes = {
    name: 'hapi-tupas-sample',
    version: '0.0.1',
    dependencies: 'inert'
};
