//EXPRESS
const express = require('express');
const router = express.Router();
const path = require('path');


//OPENSTACK
const OSWrap = require('openstack-wrapper');
const KURL = 'http://192.168.1.1:5000/v3';
const KUSER = 'admin';
const KPASSWORD = '*********';


//CONSTANTS
const ENDPOINT = {
    INSTANCE: '/instance/',
    FLAVOR: '/type/',
    IMAGE: '/image/'
}
const VERB = {
  LIST: 'list',
  STATUS: 'status',
  NEW: 'new',
  REMOVE: 'remove',
  REBOOT: 'reboot',
  FORCEREBOOT: 'forceReboot',
  LOG: 'log',
  INFO: 'info',
}


//LIST
router.get(ENDPOINT.INSTANCE + VERB.LIST + '/', (req, res, next) => {
    project().then(project => status(req, res, project)).error(err => error(req, res, err));
});
//STATUS
router.get(ENDPOINT.INSTANCE + VERB.STATUS + '/:id', (req, res, next) => {
    project().then(project => status(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//CREATE
router.get(ENDPOINT.INSTANCE + VERB.NEW + '/:flavorRef/:imageRef/:name', (req, res, next) => {
    project().then(project => create(req, res, project, {server: req.params})).error(err => error(req, res, err));
});
//REMOVE
router.get(ENDPOINT.INSTANCE + VERB.REMOVE + '/:id', (req, res, next) => {
    project().then(project => remove(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//REBOOT
router.get(ENDPOINT.INSTANCE + VERB.REBOOT + '/:id', (req, res, next) => {
    project().then(project => reboot(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//FORCE REBOOT
router.get(ENDPOINT.INSTANCE + VERB.FORCEREBOOT + '/:id', (req, res, next) => {
    project().then(project => forceReboot(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//LOG
router.get(ENDPOINT.INSTANCE + VERB.LOG + '/:id', (req, res, next) => {
    project().then(project => getlog(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//LIST
router.get(ENDPOINT.FLAVOR + VERB.LIST + '/', (req, res, next) => {
    project().then(project => flavorList(req, res, project)).error(err => error(req, res, err));
});
//INFO
router.get(ENDPOINT.FLAVOR + VERB.INFO + '/:id', (req, res, next) => {
    project().then(project => flavorInfo(req, res, project, req.params.id)).error(err => error(req, res, err));
});
//LIST
router.get(ENDPOINT.IMAGE + VERB.LIST + '/', (req, res, next) => {
    project().then(project => imageList(req, res, project)).error(err => error(req, res, err));
});
//INFO
router.get(ENDPOINT.IMAGE + VERB.INFO + '/:id', (req, res, next) => {
    project().then(project => imageInfo(req, res, project, req.params.id)).error(err => error(req, res, err));
});





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

    OSWrap.getSimpleProject(KUSER, KPASSWORD, '0000000000000000000000', KURL, function(err, proj) {
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


module.exports = router;
