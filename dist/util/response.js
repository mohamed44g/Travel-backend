export const Sendresponse = (res, code, message, data) => {
    return res.status(code).json({
        status: "success",
        message: message,
        // data: {
        //     id: data.id,
        //     name: data.name,
        //     email: data.email,
        //   },
        data,
    });
};
