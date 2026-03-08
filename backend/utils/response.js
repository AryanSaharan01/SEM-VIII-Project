const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const paginated = (res, data, total, page, limit) =>
  res.status(200).json({
    success: true,
    data,
    pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) },
  });

module.exports = { success, error, paginated };
