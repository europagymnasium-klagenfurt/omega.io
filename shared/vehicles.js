export const VEHICLE_CATEGORIES = [
    {
        name: "Sportwagen",
        vehicles: [
            { key: "sport-formula", name: "Formelwagen", image: "_-removebg-preview.png" },
            { key: "sport-hyundai", name: "Hyundai", image: "hyundai-motor-group-Sx_bKz49IO0-unsplash-removebg-preview.png" },
            { key: "sport-blue", name: "Sportwagen", image: "sportwagen-top-mit-removebg-preview.png" },
        ],
    },
    {
        name: "Monstertrucks",
        vehicles: [
            { key: "monster-croc", name: "Krokodil", image: "Monstertruck.png" },
            { key: "monster-shark", name: "Shark", image: "Monstertruck2.png" },
            { key: "monster-face", name: "Monster Face", image: "Monstertruck3.png" },
        ],
    },
    {
        name: "Fiktive Autos",
        vehicles: [
            { key: "fictional-delorean", name: "DeLorean", image: "Delorean.png" },
            { key: "fictional-gtr", name: "Nissan GT-R", image: "nissangtr.png" },
            { key: "fictional-kart", name: "Mario Kart", image: "MarioKart.png" },
        ],
    },
];

export const ALL_VEHICLES = VEHICLE_CATEGORIES.flatMap((category) => category.vehicles);
export const DEFAULT_VEHICLE_KEY = VEHICLE_CATEGORIES[0].vehicles[0].key;

export function getVehicle(key) {
    return ALL_VEHICLES.find((vehicle) => vehicle.key === key)
        ?? ALL_VEHICLES.find((vehicle) => vehicle.key === DEFAULT_VEHICLE_KEY);
}