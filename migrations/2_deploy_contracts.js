const Paris = artifacts.require("Paris");

module.exports = function (deployer) {
    deployer.deploy(
        Paris,
        "OM",
        "PSG",
        1,
        2,
        3,
        1642833511,
        120
    );
};