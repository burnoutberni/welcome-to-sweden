let jobOffices = {}

jobOffices["spanga"] = {
    latitude: 59.3794604,
    longitude: 17.9016644,
}

const findClosestOffice = (userLocation) => {
    var minimumDistance = - 1;
    var closestJobOffice;
    for (jobOffice in jobOffices) {
        var distance = Math.pow((jobOffice.latitude - userLocation.latitude), 2) +
                Math.pow((jobOffice.longitude - userLocation.longitude), 2);
        if (distance != -1 && distance < minimumDistance) {
            minimumDistance = distance;
            closestJobOffice = jobOffice;
        }
    }
    return closestJobOffice;
}

module.exports = {
    closestOffice : findClosestOffice,
}