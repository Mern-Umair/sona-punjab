export const successResponse = (res, data, message = "Success", status = 200) => {
    res.status(status).json({ success: true, message, data });
  };
  
  export const errorResponse = (res, message = "Error", status = 500) => {
    res.status(status).json({ success: false, message });
  };