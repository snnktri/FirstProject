const asyncHandler = (reqestHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqestHandler(req, res, next)).catch
        ((error)=> next(error))
    }
}


export { asyncHandler }
// cosnt asyncHandler = () => {}

// const asyncHandler = (fn) => () => {} = () => {()=>{}}

// const asyncHandler = (fn) => async () => {}

// const asyncHandler = (fn) => aync (req, res, next) => {
//     try {
//         await fn(req, res, next);

//     }
//     catch(err) {
//         res.status(err.code||500).json({success: false,
//             message: err.message
//         })
//     }
// }