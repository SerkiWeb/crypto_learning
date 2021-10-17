const Paris = artifacts.require("Paris");

module.exports = function (deployer) {
    deployer.deploy(Paris, 1, 2, 3, 1000);
};