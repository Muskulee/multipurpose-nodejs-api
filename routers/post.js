    const router = require("express").Router();

    const {
    createPost,
    deletePost,
    updatePost,
    getPost,
    getFeaturedPosts,
    getPosts,
    searchPost,
    getRelatedPosts,
    uploadImage,
    } = require("../controllers/post");
    const { parseData } = require("../middlewares");
    const multer = require("../middlewares/multer");
    const { postValidator, validate } = require("../middlewares/postValidator");

    //create posts routes
    router.post(
    "/create",
    multer.single("thumbnail"),
    parseData,
    postValidator,
    validate,
    createPost
    );

    // update post routes

    router.put(
    "/:postId",
    multer.single("thumbnail"),
    parseData,
    postValidator,
    validate,
    updatePost
    );

    //create delete posts route
    router.delete("/:postId", deletePost);
    // create get single post route
    router.get("/single/:slug", getPost);
    // create get featured posts route
    router.get("/featured-posts", getFeaturedPosts);

    // get latest posts route
    router.get("/posts", getPosts);

    // search posts route
    router.get("/search", searchPost);

    //create the similar post router

    router.get("/related-posts/:postId", getRelatedPosts);

    //single image upload route
    router.post("/upload-image", multer.single("image"), uploadImage);
    //export posts routes

    module.exports = router;
