const Paris = artifacts.require("Paris");

module.exports = function (deployer) {
    deployer.deploy(
        Paris,
        "OM",
        "PSG",
        1,
        2,
        3,
        1635893880,
        120
    );
};