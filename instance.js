//EXPRESS
const express = require('express');
const router = express.Router();
const path = require('path');
//OPENSTACK
const OSWrap = require('openstack-wrapper');
const KURL = 'http://192.168.0.1:5000/v3';
const KUSER = 'admin';
const KPASSWORD = '******';

//CONSTANTS
const ENDPOINT = {
    INSTANCE: '/instance/',
    FLAVOR: '/type/',
    IMAGE: '/image/'
}

//LIST
router.get(ENDPOINT.INSTANCE + 'list' + '/', (req, res, next) => {
    project().then(project => status(req, res, project)).error(err => error(req, res, err));
});
//STATUS
router.get(ENDPOINT.INSTANCE + 'status' + '/:id', (req, res, next) => {
    project().then(project => status(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//CREATE
router.get(ENDPOINT.INSTANCE + 'new' + '/:flavorRef/:imageRef/:name', (req, res, next) => {
    project().then(project => create(req, res, project, {server: req.params})).error(err => error(req, res, err));
});
//REMOVE
router.get(ENDPOINT.INSTANCE + 'remove' + '/:id', (req, res, next) => {
    project().then(project => remove(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//REBOOT
router.get(ENDPOINT.INSTANCE + 'reboot' + '/:id', (req, res, next) => {
    project().then(project => reboot(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//FORCE REBOOT
router.get(ENDPOINT.INSTANCE + 'forceReboot' + '/:id', (req, res, next) => {
    project().then(project => forceReboot(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//LOG
router.get(ENDPOINT.INSTANCE + 'log' + '/:id', (req, res, next) => {
    project().then(project => getlog(req, res, project, req.params.id)).error(err => error(req, res, err));
});

//LIST
router.get(ENDPOINT.FLAVOR + 'list' + '/', (req, res, next) => {
    project().then(project => flavorList(req, res, project)).error(err => error(req, res, err));
});
//INFO
router.get(ENDPOINT.FLAVOR + 'info' + '/:id', (req, res, next) => {
    project().then(project => flavorInfo(req, res, project, req.params.id)).error(err => error(req, res, err));
});

//LIST
router.get(ENDPOINT.IMAGE + 'list' + '/', (req, res, next) => {
    project().then(project => imageList(req, res, project)).error(err => error(req, res, err));
});
//INFO
router.get(ENDPOINT.IMAGE + 'info' + '/:id', (req, res, next) => {
    project().then(project => imageInfo(req, res, project, req.params.id)).error(err => error(req, res, err));
});



module.exports = router;


function reboot(req, res, project, id) {
    project.nova.rebootServer(id, () => {
        success(req, res, {
            message: `Requested ${reboot.name.toUpperCase()} sent to OS Controller for machine ${id}`
        });
    });
}

function forceReboot(req, res, project, id) {
    project.nova.forceRebootServer(id, () => {
        success(req, res, {
            message: `Requested ${reboot.name.toUpperCase()} sent to OS Controller for machine ${id}`
        });
    });
}

function remove(req, res, project, id) {
    project.nova.removeServer(id, () => {
        success(req, res, {
            message: `Requested ${reboot.name.toUpperCase()} sent to OS Controller for machine ${id}`
        });
    });
}

function create(req, res, project, data) {
    data.server.key_name = 'jairo-root';
    project.nova.createServer(data, (err, info) => {
        if (err) {
          console.log('create error!!', err);
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function getlog(req, res, project, id) {
    project.nova.getServerLog(id, 1000, (err, info) => {
        if (err) {
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function status(req, res, project, id) {
    if (id) {
        project.nova.getServer(id, (err, info) => {
            if (err) {
                error(req, res, err);
            } else {
                success(req, res, info);
            }
        });
    } else {
        project.nova.listServers((err, servers) => {
            if (err) {
                error(req, res, err);
            } else {
                success(req, res, servers);
            }
        });
    }
}

function flavorList(req, res, project) {
    project.nova.listFlavors((err, info) => {
        if (err) {
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function flavorInfo(req, res, project, id) {
    project.nova.getFlavor(id, (err, info) => {
        if (err) {
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function imageList(req, res, project) {
    project.glance.listImages((err, info) => {
        if (err) {
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function imageInfo(req, res, project, id) {
    project.glance.getImage(id, (err, info) => {
        if (err) {
            error(req, res, err);
        } else {
            success(req, res, info);
        }
    });
}

function success(req, res, data) {
    res.json({
      status: 'OK',
      statusCode: 200,
      data: data
    });
}

function error(req, res, err) {
    res.json({
        status: 'KO',
        statusCode: 400,
        statusMessage: err
    });
}

function project() {
    var success = function(c) {};
    var error = function(c) {};
    //Promise

    OSWrap.getSimpleProject(KUSER, KPASSWORD, '56e904d60a8f4a3ead0062bad6184815', KURL, function(err, proj) {
        if (err) {
            error(err);
        } else {
            success(proj);
        }
    });

    //Promise
    return {
        then: function(cb) {
            success = cb;
            return this;
        },
        error: function(cb) {
            error = cb;
            return this;
        }
    };
}
