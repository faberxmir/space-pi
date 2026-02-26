function createHttpServer(app, logger ) {
    const PORT = process.env.PORT || 3000;
    let server = null; 
    
    return {
        name: "httpServer",
        start() {
            if (server) {
                logger?.warn?.("A start attempt was made while the HTTP server is already running.");
                return;
            }
            server = app.listen(PORT, () => {
                logger?.info?.(`HTTP server listening on port ${PORT}`);
            });
        },
        status() {
            
        },
        stop() {
            // Implement graceful shutdown
            return new Promise((resolve, reject) => {
                if (!server) {
                    logger?.warn?.("HTTP server is not running");
                    return resolve();
                }
                server.close((err) => {
                    if (err) {
                        logger?.error?.(`Error shutting down HTTP server: ${err}`);
                        return reject(err);
                    }
                    logger?.info?.("HTTP server shut down gracefully");
                    server = null;
                    resolve();
                });
            });
        }
    }
}

module.exports = { createHttpServer };