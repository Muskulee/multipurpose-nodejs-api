// import post schemna
const Post = require("../models/post");
const FeaturedPost = require("../models/featuredPost");
const cloudinary = require("../cloud");
const { isValidObjectId } = require("mongoose");

//create add to featured post function

const featuredPostCount = 4;

const addToFeaturedPost = async (postId) => {
  //check if featured post is already added

  const isAlreadyExists = await FeaturedPost.findOne({ post: postId });
  if (isAlreadyExists) return;

  const featuredPost = new FeaturedPost({ post: postId });
  await featuredPost.save();

  //remove previous post from featured post
  const featuredPosts = await FeaturedPost.find({}).sort({ createdAt: -1 });
  featuredPosts.forEach(async (featuredPost, index) => {
    if (index >= featuredPostCount) {
      await FeaturedPost.findByIdAndDelete(featuredPost._id);
    }
  });
};

const removeFromFeaturedPost = async (postId) => {
  //delete featured post by posID
  await FeaturedPost.findOneAndDelete({ post: postId });
};

const isFeaturedPost = async (postId) => {
  //check if post is featured
  const post = await FeaturedPost.findOne({ post: postId });
  console.log("post", post);
  return post ? true : false;
};

exports.createPost = async (req, res) => {
  //   console.log("req.body(", req.body);

  //destructure the body data

  if (!req.body.author) {
    req.body.author = "Admin";
  }

  req.body.likeCount = 0;
  req.body.commentCount = 0;

  const {
    title,
    content,
    meta,
    slug,
    tags,
    author,
    likeCount,
    commentCount,
    featured,
  } = req.body;

  const { file } = req;


  const newPost = new Post({
    title,
    content,
    meta,
    slug,
    tags,
    author,
    likeCount,
    commentCount,
  });

  //check if post already exists with slug

  const isAlreadyExists = await Post.findOne({ slug });
  if (isAlreadyExists) {
    return res.json({
      error: "Please use unique slug and ensure post is not a duplicate",
    });
  } else {
    // console.log("req.file", req.file);

    //save the new post with the newpost .save() method
    if (file) {
      const result = await cloudinary.uploader.upload(file.path);

      const url = result.url;
      const public_id = result.public_id;
      newPost.thumbnail = { url, public_id };
      //     console.log("newPost._id", result.thumbnail);
      //   console.log("newPost._url", result.url);
    }

    console.log("newPost", newPost);

    await newPost.save();
    // res.send(json(newPost));

    //if featured post is available, save featured post using postObject Id

    if (featured) {
      await addToFeaturedPost(newPost._id);
    }

     // return res.json({post: newPost});

     return res.json({
      post: {
        id: newPost._id,
        title: newPost.title,
        meta: newPost.meta,
        slug: newPost.slug,
        thumbnail: newPost.thumbnail?.url,
        author: newPost.author,
      },
    });



   
  }
};

exports.deletePost = async (req, res) => {
  // get the url params

  const {
    title,
    content,
    meta,
    slug,
    tags,
    author,
    likeCount,
    commentCount,
    featured,
  } = req.body;

  const { file } = req;

  const { postId } = req.params;
  if (!isValidObjectId(postId))
    return res.status(401).json({ error: "Invalid Request!" });

  // find post
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "No post found!" });

  //   check if posts has a thumbnail
  const public_id = post.thumbnail?.public_id;
  if (public_id) {
    // remove thumbnail from clodinary
    const { result, error } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok")
      return res
        .status(404)
        .json({ error: "Could not remove thumbnail from cloudinary!" });
  }

  await Post.findByIdAndDelete(postId);

  //

  await removeFromFeaturedPost(postId);

  //
  res.json({ message: "Post Deleted Successfully!" });
};

exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  if (!isValidObjectId(postId))
    return res.status(401).json({ error: "Invalid Request!" });

  // find post
  const { file } = req;
  const {
    title,
    content,
    meta,
    slug,
    tags,
    author,
    likeCount,
    commentCount,
    featured,
  } = req.body;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "No post found!" });

  //   check if posts has a thumbnail
  const public_id = post.thumbnail?.public_id;
  if (public_id && file) {
    // remove thumbnail from clodinary
    const { result, error } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok")
      return res
        .status(404)
        .json({ error: "Could not remove thumbnail from cloudinary!" });
  }

  //save the new post with the newpost .save() method
  if (file) {
    const result = await cloudinary.uploader.upload(file.path);

    const url = result.url;
    const public_id = result.public_id;
    post.thumbnail = { url, public_id };
    //     console.log("newPost._id", result.thumbnail);
    //   console.log("newPost._url", result.url);
  }

  post.title = title;
  post.meta = meta;
  post.content = content;
  post.slug = slug;
  post.author = author;
  post.tags = tags;
  post.likeCount = likeCount;
  post.commentCount = commentCount;

  if (featured) await addToFeaturedPost(post._id);
  else await removeFromFeaturedPost(post._id);

  await post.save();

  return res.json({
    post: {
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
      content,
      featured,
    },
  });
};

exports.getPost = async (req, res) => {
  const { slug } = req.params;
  if (!slug) return res.status(401).json({ error: "Invalid Request!" });
  const post = await Post.findOne({ slug });
  if (!post) return res.status(404).json({ error: "Post Not Found!" });

  const featured = await isFeaturedPost(post._id);

  res.json({
    post: {
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      tags: post.tags,
      author: post.author,
      content: post.content,
      featured: featured,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
    },
  });
};

exports.getFeaturedPosts = async (req, res) => {
  //find all featured posts
  const featuredPosts = await FeaturedPost.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("post");
  res.json({
    posts: featuredPosts.map(({ post }) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
      content: post.content,
      //   featured,
    })),
  });
};

exports.getPosts = async (req, res) => {
  const { pageNo = 0, limit = 10 } = req.query;
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const postCount = await Post.countDocuments();

  res.json({
    posts: posts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
      content: post.content,
      createdAt: post.createdAt,
      tags: post.tags,
      likeCount: post.likeCount,
      commentCount: post.commentCount,

      //   featured,
    })),
    postCount,
  });
};

exports.searchPost = async (req, res) => {
  const { title } = req.query;

  if (!title.trim()) return res.status(401).json({ error: "Missin Query!" });
  const posts = await Post.find({ title: { $regex: title, $options: "i" } });
  res.json({
    posts: posts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
      content: post.content,
      createdAt: post.createdAt,
      tags: post.tags,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      //   featured,
    })),
  });
};

exports.getRelatedPosts = async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId))
    return res.status(401).json({ error: "Invalid Request!" });

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "No Post Found!" });

  const relatedPosts = await Post.find({
    tags: { $in: [...post.tags] },
    _id: { $ne: post._id },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const { title } = req.query;

  res.json({
    posts: relatedPosts.map((post) => ({
      id: post._id,
      title: post.title,
      meta: post.meta,
      slug: post.slug,
      thumbnail: post.thumbnail?.url,
      author: post.author,
      content: post.content,
      //   featured,
    })),
  });
};

exports.uploadImage = async (req, res) => {
  //check for file

  const { file } = req;
  if (!file) res.status(401).json({ error: "Image File Not Found!" });

  //save the new post with the newpost .save() method
  if (file) {
    const result = await cloudinary.uploader.upload(file.path);
    const url = result.url;

    res.status(201).json({ image: url });
  }
};
