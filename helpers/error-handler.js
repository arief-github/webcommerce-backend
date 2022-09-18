function errorHandler(err, req, res, next) {
	// jwt auth error
	if(err.name === 'UnauthorizedError') {
		return res.status(401).json({ message: "The User is not authorized" })
	}

	if(err.name === 'ValidationError') {
		// validation Error
		return res.status(401).json({ message: err })
	}

	// default error
	return res.status(500).json(err);
}

module.exports = errorHandler;