const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt = require('jsonwebtoken');

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

//Aquí se crea usuario con contraseña encriptada (Inicio)
const create = catchError(async(req, res) => {
    const { email, password, firstName, lastName, country, image, frontBaseUrl } = req.body;
    const encriptePassword = await bcrypt.hash(password, 10); // pasamos la constraseña que viene del body, y el 10 para el número de vueltas
    const result = await User.create({  //vamos a pasar cada uan de las propiedades
        email, password: encriptePassword, firstName, lastName, country, image
    });

    //Para crear code y link en el correo
    const code = require('crypto').randomBytes(32).toString("hex");
    const link = `${frontBaseUrl}/${code}`;

    //Para generar registro de code y id en  la tabla de EmailCode
    await EmailCode.create({
        code,
        userId: result.id,
    });

    //Para enviar email de verificación de correo al usuario que acaba de crear una cuenta (Inicio)
    await sendEmail({
        to: email, //el email le va llegar al correo del usuario que se acaba de cear una cuenta
        subject: "Verify email for user app",
        html:  `
        <h1> Hello ${firstName} ${lastName}</h1>
        <p><a href="${link}">${link}</a></p>
        <p><b>Code:</b>${code}</p>
        <b>Thanks for sign up in user app</b>
        `,
    });
    //Fin de verificación


    return res.status(201).json(result);
});

//Fin 


const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

//Validación para que el password sea el único campo que el usuario no pueda modificar asi de simple, 
//puesto que para estos casos se maneja la recuperación de contraseña mediante verificación en email
const update = catchError(async(req, res) => {
    const { id } = req.params;
    const { email, firstName, lastName, country, image } = req.body;
    const result = await User.update(
        { email, firstName, lastName, country, image },
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

//para validar que el usuario haya verificado su correo, y que el code que recibió sea el mismo que el que se le envío en el link
const verifyEmail = catchError(async(req, res) => {
    const { code } = req.params;
    const emailCode =  await EmailCode.findOne({ 
        where: { code: code } 
    });
    if(!emailCode) return res.status(401).json({ message: "Invalid code"})
    const user = await User.update(
        { isVerified: true},
        { where: { id: emailCode.userId }, returning: true }
);
    await emailCode.destroy();
    return res.json(user[1][0]);
});

//verificación de usuario y contraseña para  el login que genere token
const login = catchError(async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) return res.status(401).json({ message: "incorrect credentials" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "incorrect credentials" });
    if(user.isVerified === false) return res.status(401).json({ message: "User not verified" }); //esta validacion es
    //para evitar que los usuarios que no estén verificados, no puedan loguearse
    
    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: '1d' }, //expiresIn"  representa un intervalo de tiempo, 1d significa un día.
    );

    return res.json({user, token});
});
//para crer endpoint de un usuario logeado, de lo contrario te saca
const getLoggedUser =  catchError(async(req, res) => {
    return req.user;
});

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyEmail,
    login,
    getLoggedUser 
}