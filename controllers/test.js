exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      test,
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createTest = async (req, res, next) => {
  const { title, description, questions } = req.body;

  const test = new Test({
    title,
    description,
    questions,
  });

  try {
    await test.save();
    res.status(201).json({
      test,
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateTest = async (req, res, next) => {
  const { title, description, questions } = req.body;

  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = 404;
      throw error;
    }

    test.title = title;
    test.description = description;
    test.questions = questions;

    await test.save();
    res.status(200).json({
      test,
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = 404;
      throw error;
    }

    await test.remove();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
