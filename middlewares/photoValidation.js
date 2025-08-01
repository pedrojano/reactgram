const {body} = require("express-validator");

const photoInsertValidation = () => {
    return [
        body("title")
            .not()
            .equals("undefined")
            .withMessage("O título é obrigatório! 1")
            .isString()
            .withMessage("O título é obrigatório! 2")
            .isLength({min: 3})
            .withMessage("O título precisa ter no mínimo 3 caracteres!"),
        body("image").custom((value, {req}) => {
            if(!req.file){
                throw new Error("A imagem é obrigatória!")
            }
            return true;
        }),
    ];
};

module.exports = {
    photoInsertValidation,

};