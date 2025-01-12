const userRepository = require('../repositories/userRepository');

const alreadyExists = (e) => e.message && e.message.indexOf('duplicate key') > -1

const hasErrors = (e) => e._message === 'user validation failed'

const handleErrors = (e, res) => {
    if (alreadyExists(e))
        res.status(409).send('User already exists');
    else if (hasErrors(e))
        res.status(400).json(e.errors);
    else
        res.status(500).send('Internal Server Error');
}

const register = async (req, res) => {
    try {
        const data = req.body;
        data.createdAt = Date.now();
        await userRepository.add(data);
        res.status(201);
        res.send();
    } catch (e) {
        handleErrors(e, res);
    }
};

const update = async (req, res) => {
    try {
        const email = req.params.email;
        await userRepository.update(email, req.body);

        res.status(204);
        res.send();
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
}

const getUsers = async (req, res) => {
    try {
        const pageIndex = +req.params.page || 0;
        const pageSize = +req.params.size || 10;
        const options = {
            name: req.query.name || '',
            qualification: +req.query.qualification,
            degree: +req.query.degree,
        };
        const totalRecords = await userRepository.getUserCount(options);
        const totalPages = Math.ceil(totalRecords / pageSize);
        const users = await userRepository.getUsers(pageIndex, pageSize, options);

        const response = {
            data: users,
            metadata: {
                totalRecords: totalRecords,
                totalPages: totalPages
            }
        };
        res.status(200);
        res.json(response);
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
}

const getUserByEmail = (req, res) => {
    userRepository.getUserByEmail(req.params.email)
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).send('Internal Server Error'));
}

module.exports = {
    register,
    update,
    getUsers,
    getUserByEmail
};
