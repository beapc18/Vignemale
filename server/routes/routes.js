var appRouter = function(router, mongo) {

    router.get("/", function(req, res) {
        res.json({"error" : false,"message" : "Hello World"});
    });
};

module.exports = appRouter;