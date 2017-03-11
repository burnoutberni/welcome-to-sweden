var jobOffices = {}

jobOffices["spanga"] = {
    latitude: 59.3794604,
    longitude: 17.9016644,
}

const findClosestOffice = (userLocation) => {
    var minimumDistance = 1000000000000000;
    var closestJobOffice;
    for (var jobOfficeName in jobOffices) {
        var jobOffice = jobOffices[jobOfficeName];
        var distance = Math.pow((jobOffice.latitude - userLocation.latitude), 2) +
                Math.pow((jobOffice.longitude - userLocation.longitude), 2);
        if (distance < minimumDistance) {
            minimumDistance = distance;
            closestJobOffice = jobOffice;
        }
    }
    return [closestJobOffice, minimumDistance];
}

module.exports = {
    closestOffice : findClosestOffice,
}