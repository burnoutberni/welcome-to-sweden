var jobOffices = {}
var jobOffers = [{
  name: "Baker",
  company: "Petit Paris",
  type: "Full-time",
}, {
  name: "Software engineer",
  company: "Spotify",
  type: "Full-time"
}]

jobOffices["spanga"] = {
  latitude: 59.3794604,
  longitude: 17.9016644,
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

const findClosestOffice = (userLocation) => {
    var minimumDistance = 1000000000000000;
    var closestJobOffice;
    for (var jobOfficeName in jobOffices) {
        var jobOffice = jobOffices[jobOfficeName];

        var R = 6371; // km
        var lat1 = jobOffice.latitude;
        var lon1 = jobOffice.longitude;
        var lat2 = userLocation.latitude;
        var lon2 = userLocation.longitude;

        var dLat = toRad(lat1 - lat2);
        var dLon = toRad(lon1 - lon2);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c;
        //var distance = Math.pow((jobOffice.latitude - userLocation.latitude), 2) +
        //        Math.pow((jobOffice.longitude - userLocation.longitude), 2);
        if (distance < minimumDistance) {
            minimumDistance = distance;
            closestJobOffice = jobOfficeName;
        }
    }
    return { name: closestJobOffice, distance: Math.round(minimumDistance * 10) / 10 };
}

const findClosestJobOffers = () => {
    return jobOffers;
}

module.exports = {
    closestOffice : findClosestOffice,
    closestJobOffers: findClosestJobOffers,
}
