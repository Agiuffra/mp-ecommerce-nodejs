var express = require('express');
var exphbs = require('express-handlebars');
var port = process.env.PORT || 3000
const mercadopago = require('mercadopago');

var app = express();
mercadopago.configure({
    access_token: 'APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439',
    integrator_id: 'dev_2e4ad5dd362f11eb809d0242ac130004'
});
const comprador = {
    name: 'Lalo',
    surname: 'Landa',
    email: 'test_user_46542185@testuser.com',
    phone: {
        area_code: '52',
        number: 5549737300
    },
    identification: {
        type: 'DNI',
        number: '22334445'
    },
    address: {
        zip_code: '03940',
        street_name: 'Insurgentes Sur',
        street_number: 1602
    }
}
const metodos_pago = {
    installments: 6,
    excluded_payment_methods: [
        {
            id: 'diners'
        }
    ],
    excluded_payment_types: [
        {
            id: 'atm'
        }
    ]
}
let back_urls = {
    success: '',
    pending: '',
    failure: ''
}
let preference = {
    items: [],
    payer: comprador,
    payment_methods: metodos_pago,
    back_urls: back_urls,
    notification_url: '',
    statement_descriptor: 'MITIENDA',
    auto_return: 'approved',
    external_reference: 'alessandro.giuffra@utec.edu.pe'
}
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', async function (req, res) {
    req.get('host');
    let item = {
        id: '1234',
        title: req.query.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: req.get('host') + req.query.img.slice(1),
        quantity: +req.query.unit,
        currency_id: "PEN",
        unit_price: +req.query.price
    }
    preference.back_urls.success = `${req.get('host')}/success`;
    preference.back_urls.pending = `${req.get('host')}/pending`;
    preference.back_urls.failure = `${req.get('host')}/failure`;
    preference.items = [];
    preference.items.push(item);
    preference.notification_url = `${req.get('host')}/notificaciones_mercadopago`;
    try {
        const respuestaMP = await mercadopago.preferences.create(preference);
        console.log(respuestaMP);
        req.query.init_point = respuestaMP.body.init_point;
    } catch (error) {
        console.log(error);
    }
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    res.render('success', req.query);
});
app.get('/pending', function (req, res) {
    res.render('pending', req.query);
});
app.get('/failure', function (req, res) {
    res.render('failure', req.query);
});

app.post('/notificaciones_mercadopago', function (req,res) {
    console.log('Esto es query');
    console.log(req.query);
    console.log('Esto es body');
    console.log(req.body);
    res.status(201).send('received');
});

app.listen(port);