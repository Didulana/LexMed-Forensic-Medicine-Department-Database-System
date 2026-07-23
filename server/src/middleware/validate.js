const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;
      
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
  };
};

module.exports = {
  validate
};
