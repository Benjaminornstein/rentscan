import { useState, useEffect, useRef } from "react";
import { useScreenViewport } from "./useScreenViewport";

// ===== COMPANY DATA =====
const COMPANIES = [
  // === BUDGET (real scraped prices) ===
  { id: 1, name: "Rental Cars UAE", logo: "🟢", rating: 4.6, reviews: 370, verified: true, allIn: false, location: "Al Quoz, DXB Airport, Dubai Marina", delivery: true, deposit: 1000, cars: [
    { type: "Economy", model: "Kia Pegas 2025", perDay: 45, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "MG 3 2025", perDay: 47, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 50, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Kia Picanto 2025", perDay: 52, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 54, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Rush 2025", perDay: 90, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["Cheapest daily rates in Dubai", "Free delivery on monthly", "60-90 min delivery"], cons: ["Deposit required", "Basic insurance only"] },
  { id: 2, name: "Quick Drive", logo: "⚡", rating: 4.5, reviews: 1870, verified: true, allIn: true, location: "Deira, Business Bay, JLT", delivery: true, deposit: 1500, cars: [
    { type: "Economy", model: "MG3 2025", perDay: 72, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Citroen C3 2025", perDay: 80, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Mitsubishi ASX 2025", perDay: 84, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Citroen C5 Aircross 2025", perDay: 92, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["Transparent pricing", "10% discount pay-now", "Free delivery"], cons: ["Limited luxury fleet"] },
  { id: 3, name: "Great Dubai", logo: "🌟", rating: 4.4, reviews: 520, verified: true, allIn: false, location: "Business Bay, Deira", delivery: true, deposit: 1000, cars: [
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 70, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 80, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Hyundai Tucson 2025", perDay: 150, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Mercedes C-Class 2025", perDay: 350, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Competitive rates", "Wide selection", "Free delivery"], cons: ["Basic CDW on economy"] },
  { id: 4, name: "Al Emad Cars", logo: "🔷", rating: 4.7, reviews: 890, verified: true, allIn: false, location: "Dubai Marina, Al Barsha, Abu Dhabi", delivery: true, deposit: 1000, cars: [
    { type: "Economy", model: "MG 5 2026", perDay: 85, insurance: "Roadside assist incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Dongfeng Shine 2026", perDay: 99, insurance: "Roadside assist incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "GAC Emzoom GS3 2026", perDay: 110, insurance: "Roadside assist incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Omoda C5 2026", perDay: 150, insurance: "Roadside assist incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Nissan X-Terra 2025", perDay: 190, insurance: "Roadside assist incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Nissan Patrol 2026", perDay: 699, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["300+ cars", "New 2026 models", "No hidden fees", "Dubai + Abu Dhabi"], cons: ["Chinese brands in economy", "Insurance upgrade recommended"] },
  { id: 5, name: "Motorkart", logo: "🏁", rating: 4.3, reviews: 640, verified: true, allIn: true, location: "Al Quoz, Sheikh Zayed Rd", delivery: true, deposit: 1500, cars: [
    { type: "Economy", model: "Nissan Sunny 2021", perDay: 80, insurance: "Insurance incl.", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Mitsubishi Attrage 2024", perDay: 90, insurance: "Insurance incl.", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 95, insurance: "Insurance incl.", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Land Rover Defender 110 2025", perDay: 850, insurance: "Insurance incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Range Rover Vogue V8 2025", perDay: 1200, insurance: "Insurance incl.", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Insurance included", "Free delivery", "Economy to luxury"], cons: ["200km/day on economy", "Older models in budget range"] },
  { id: 6, name: "Absolute Rent a Car", logo: "🔴", rating: 4.0, reviews: 2450, verified: true, allIn: false, location: "Deira, Bur Dubai, DXB Airport", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Sedan (various)", perDay: 210, insurance: "CDR included (AED 1500 excess)", mileage: "250km/day", fuel: "Full tank provided", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "SUV (various)", perDay: 210, insurance: "CDR included (AED 1500 excess)", mileage: "250km/day", fuel: "Full tank provided", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Convertible / Sports", perDay: 650, insurance: "CDR included", mileage: "300km/day", fuel: "Full tank provided", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Electric", model: "Electric Car", perDay: 450, insurance: "CDR included", mileage: "250km/day", fuel: "Charging card provided", salikIncl: false, airportFee: 0, img: "⚡" }],
    pros: ["Free pickup/drop-off Dubai", "Min age 21", "Full tank included"], cons: ["AED 1,500 excess if at fault", "Deposit returned after 30 days", "Min 3 day rental"] },
  // === MID-RANGE (real scraped prices) ===
  { id: 7, name: "Udrive", logo: "🚙", rating: 3.2, reviews: 4850, verified: true, allIn: false, location: "App-based — Dubai, Abu Dhabi, Sharjah", delivery: false, deposit: 0, cars: [
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 129, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Mitsubishi Attrage 2025", perDay: 135, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Kia Picanto 2025", perDay: 139, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Toyota Corolla 2025", perDay: 149, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Rush 2025", perDay: 149, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Ford Territory 2025", perDay: 188, insurance: "Basic incl.", mileage: "150km/day", fuel: "Fuel included", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["Zero deposit", "Free fuel included", "Free parking", "App-based instant"], cons: ["150km/day limit", "AED 2.10/km excess", "Damage waiver optional"] },
  // === INTERNATIONAL BRANDS ===
  { id: 8, name: "Hertz UAE", logo: "🟡", rating: 4.6, reviews: 2890, verified: true, allIn: true, location: "DXB T1/T2/T3, Motor City, Marina, 14 locations", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 70, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota RAV4 2025", perDay: 180, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Volvo S90 2025", perDay: 350, insurance: "Full CDW + SCDW available", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["14 locations in UAE", "All airport terminals", "2,025+ vehicles", "GPS & WiFi available"], cons: ["Deposit hold up to 30 days", "SCDW costs extra"] },
  { id: 9, name: "Europcar Dubai", logo: "🟢", rating: 4.1, reviews: 1950, verified: true, allIn: true, location: "DXB T1/T2/T3, Al Quoz, 14+ branches", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2024", perDay: 70, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Prado 2025", perDay: 200, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Audi A6 2025", perDay: 320, insurance: "CDW included", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Since 1976 in Dubai", "14+ branches", "Monthly from AED 1,219"], cons: ["Salik billed separately", "Extra charges for late return"] },
  { id: 10, name: "Sixt Dubai", logo: "🟠", rating: 4.4, reviews: 1340, verified: true, allIn: true, location: "DXB Airport, Sheikh Zayed Rd, 4 locations", delivery: true, deposit: 2500, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 85, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Nissan X-Trail 2025", perDay: 175, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "BMW 5 Series 2025", perDay: 380, insurance: "CDW + Theft Protection", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Premium fleet", "Chauffeur service available", "Corporate offers"], cons: ["Higher base rates", "Young driver fee"] },
  { id: 11, name: "Saadat Rent", logo: "🔵", rating: 4.3, reviews: 980, verified: true, allIn: true, location: "Al Barsha, JVC, Dubai Airport", delivery: true, deposit: 700, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 73, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Rush 2025", perDay: 140, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["Low deposit AED 700", "Online booking no calls needed", "Full insurance LDW available"], cons: ["Smaller fleet", "Newer company"] },
  // === LUXURY (real scraped prices) ===
  { id: 12, name: "Taite Luxury", logo: "💎", rating: 4.9, reviews: 410, verified: true, allIn: true, location: "Palm Jumeirah, DIFC, Downtown", delivery: true, deposit: 0, cars: [
    { type: "SUV", model: "Audi RSQ8 Performance 2025", perDay: 1500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Lamborghini Urus Performante", perDay: 3500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Rolls Royce Cullinan", perDay: 4500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari 296 GTB", perDay: 4500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari SF90 Stradale", perDay: 7500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Lamborghini Aventador SVJ", perDay: 12000, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" }],
    pros: ["Zero deposit", "All-inclusive pricing", "Salik included", "WhatsApp booking"], cons: ["Luxury only — no budget cars", "Premium prices"] },
  { id: 13, name: "Trinity Rental", logo: "👑", rating: 4.8, reviews: 320, verified: true, allIn: true, location: "Downtown, DIFC, Palm Jumeirah", delivery: true, deposit: 0, cars: [
    { type: "SUV", model: "Range Rover Sport 2025", perDay: 1600, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Porsche 911 Turbo S", perDay: 3200, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari F8 Spider", perDay: 3700, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Lamborghini Urus Mansory", perDay: 3500, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari Purosangue", perDay: 9500, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" }],
    pros: ["No deposit", "80+ car fleet", "Personal manager", "Fast delivery"], cons: ["Luxury only", "Premium pricing"] },
  { id: 14, name: "Babil Rent a Car", logo: "🔶", rating: 4.5, reviews: 280, verified: true, allIn: true, location: "Sheikh Zayed Rd, Business Bay", delivery: true, deposit: 0, cars: [
    { type: "Luxury", model: "Ford Mustang GT", perDay: 799, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Mercedes S-Class AMG Brabus", perDay: 899, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Chevrolet Corvette C8", perDay: 1100, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "SUV", model: "BMW X7 2025", perDay: 1299, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Mercedes G63 2025", perDay: 1399, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "McLaren Artura", perDay: 4299, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari SF90 Spider", perDay: 5500, insurance: "Insurance incl.", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Zero deposit", "Insurance included", "Free delivery"], cons: ["Luxury only — no economy", "Premium segment"] },
  { id: 15, name: "Rent Any Car", logo: "🏆", rating: 4.9, reviews: 500, verified: true, allIn: true, location: "Al Quoz, Downtown, Marina", delivery: true, deposit: 0, cars: [
    { type: "Economy", model: "Mini Cooper S", perDay: 349, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Audi Q3 Sportback", perDay: 550, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "SUV", model: "Land Rover Defender 2025", perDay: 1100, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Porsche 911 Turbo S", perDay: 3200, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Lamborghini Urus Mansory", perDay: 3500, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Ferrari Purosangue", perDay: 9500, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Google 4.9 rating", "18K+ Instagram followers", "Premium fleet"], cons: ["Premium pricing", "Limited budget options"] },
  { id: 16, name: "MK Rent a Car", logo: "🔥", rating: 4.6, reviews: 210, verified: true, allIn: true, location: "Dubai Marina, JBR, Downtown", delivery: true, deposit: 0, cars: [
    { type: "SUV", model: "Range Rover Sport 2025", perDay: 1499, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Mercedes G63 AMG 2025", perDay: 1999, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    { type: "Luxury", model: "Rolls Royce Ghost 2025", perDay: 3500, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" }],
    pros: ["Zero deposit", "All-inclusive", "Salik included", "Unlimited mileage"], cons: ["Luxury only", "Premium segment"] },
];

const PHOTO_GUIDES = [
  // OVERVIEW SHOTS
  { id: "front", label: "Front — overview", tip: "Stand 3 meters back. Capture the full front: bumper, hood, headlights and license plate in one shot.", icon: "⬆️" },
  { id: "front-close", label: "Front — close-up", tip: "Now walk up close. Run your fingers along the bumper edges, around headlights, and hood edges. Photograph ANY scratch, chip or dent you find — even tiny ones.", icon: "🔎" },
  { id: "right", label: "Right side — overview", tip: "Step back 3 meters. Capture the full right side: all doors, fender, and wheel arches in one shot.", icon: "➡️" },
  { id: "right-close", label: "Right side — close-up", tip: "Walk along the right side slowly. Check door edges, handles, mirrors, and the area below the doors. Crouch down — scratches from curbs hide low. Photo everything.", icon: "🔎" },
  { id: "rear", label: "Rear — overview", tip: "Stand 3 meters back. Full rear: bumper, tail lights, trunk, license plate.", icon: "⬇️" },
  { id: "rear-close", label: "Rear — close-up", tip: "Check bumper corners carefully — this is the #1 spot for parking damage. Feel the surface with your hand. If you feel anything rough, photograph it.", icon: "🔎" },
  { id: "left", label: "Left side — overview", tip: "Step back. Full left side: all doors, fender, wheel arches.", icon: "⬅️" },
  { id: "left-close", label: "Left side — close-up", tip: "Same routine: door edges, handles, mirrors, lower panels. Check the fuel cap area for scratches too.", icon: "🔎" },
  // WHEELS & ROOF
  { id: "wheels", label: "All 4 wheels", tip: "Photograph each wheel. Curb rash on alloy rims is a common charge — AED 500+ per wheel. Check the rim edges carefully.", icon: "🛞" },
  { id: "roof", label: "Roof & windshield", tip: "Step back and angle your camera up. Check for dents on roof (from hail/objects) and chips/cracks in the windshield. Even small chips can cost AED 300+.", icon: "🔝" },
  // INTERIOR
  { id: "dash", label: "Dashboard & controls", tip: "Sit in driver seat. Photograph the full dashboard, all warning lights (should be off), and infotainment screen. If any warning light is on — photograph it!", icon: "🎛️" },
  { id: "odo", label: "Odometer / mileage", tip: "Zoom in clearly on the km reading. This is your proof of starting mileage. Make sure the number is sharp and readable.", icon: "🔢" },
  { id: "fuel", label: "Fuel gauge", tip: "Clear photo of fuel level. You MUST return at this exact level or get charged AED 3-5 per missing liter + service fee.", icon: "⛽" },
  { id: "seats", label: "Seats & interior", tip: "Photo all seats, especially edges and headrests. Check for stains, tears, or cigarette burns. Photo the floor mats too.", icon: "💺" },
  { id: "trunk", label: "Trunk / boot", tip: "Open trunk. Photo inside. Check for spare tire, jack and triangle. Note any existing stains or damage.", icon: "🧳" },
  // FINAL
  { id: "damage", label: "Existing damage", tip: "Final check! Walk around one more time. Any scratch, dent, or mark you found — take a CLOSE-UP photo with your finger pointing at it, plus a WIDE shot showing where on the car it is.", icon: "⚠️" },
];

const DISPUTES = {
  damage: { title: "Unfair damage charge", steps: ["Gather pickup/return photos with timestamps from your dossier", "Compare claimed damage vs your photos", "Email the company with timestamped evidence, request their proof", "If they can't provide evidence, dispute and request refund", "File complaint: DED Consumer Protection (consumerrights.ae) or 600 54 5555", "Credit card? Contact bank for chargeback with your dossier", "Keep everything in writing — never agree verbally"] },
  deposit: { title: "Deposit not returned", steps: ["Check contract for return timeline (typically 21-30 days)", "Send formal email with contract reference number", "Include: name, dates, car details, deposit amount, bank statement", "Give 7 days to respond, then warn of complaint", "File with DED Consumer Protection", "Credit card hold? Contact bank after 30 days", "UAE Law No. 15/2020 requires clear deposit refund conditions"] },
  overcharge: { title: "Unexpected charges", steps: ["Request itemized final invoice", "Cross-reference each charge with your contract", "Verify Salik on RTA app (darb.ae)", "Verify fines on Dubai Police app", "Compare your fuel return photo with their claim", "Send dispute email with evidence per charge", "If unresolved: file with DED Consumer Protection"] },
  accident: { title: "Accident or breakdown", steps: ["Ensure safety — call 999 (emergency) or 901 (police)", "Do NOT move vehicle until police arrive (UAE law)", "Photograph everything: all vehicles, location, damage", "Get police report number — needed for insurance", "Contact rental company immediately", "Green report = not at fault. Red report = at fault (excess applies)", "Document everything in your RentScan dossier"] },
};

// ===== HELPERS =====
const calcTrue = (car, co, days) => {
  let t = car.perDay * days;
  if (car.airportFee) t += car.airportFee;
  if (!car.salikIncl) t += Math.round(days * 3.2 * 7);
  if (car.insurance.includes("Basic")) t += (car.type === "Luxury" ? 60 : car.type === "SUV" ? 35 : 25) * days;
  if (car.fuel.includes("Not included")) t += days * 25;
  const m = car.mileage.match(/(\d+)/);
  if (m) { const k = parseInt(m[1]); if (k <= 150) t += days * 20; else if (k <= 200) t += days * 15; else if (k <= 250) t += days * 8; }
  return Math.round(t);
};

// Fallback local analysis if API fails
const localAnalyze = (text) => {
  const t = text.toLowerCase();
  let rate = 150, days = 7, type = "economy";
  const rm = text.match(/(\d{2,4})\s*(?:aed|dhs)?\s*(?:\/|per)\s*day/i); if (rm) rate = parseInt(rm[1]);
  const dm = text.match(/(\d+)\s*days?/i); if (dm) days = parseInt(dm[1]);
  if (t.match(/suv|fortuner|x5|patrol|tucson/)) type = "suv";
  if (t.match(/luxury|bmw|mercedes|porsche|audi/)) type = "luxury";
  const base = rate * days;
  const costs = [
    { label: "Base rental", amount: base, type: "base", detail: `${rate} AED × ${days} days` },
    { label: "Salik tolls (est.)", amount: Math.round(days * 3.2 * 7), type: "extra", detail: "~3.2 crossings/day" },
    { label: "Fuel cost estimate", amount: t.includes("full") ? 60 : 120, type: "maybe", detail: t.includes("full") ? "Refuel before return" : "Fuel policy unclear" },
  ];
  if (!t.includes("full cover") && !t.includes("zero excess")) costs.push({ label: "Insurance upgrade", amount: (type === "luxury" ? 60 : type === "suv" ? 35 : 25) * days, type: "opt", detail: "Basic CDW — full cover available" });
  if (t.match(/airport|dxb/)) costs.push({ label: "Airport surcharge", amount: 50, type: "extra", detail: "Airport fee" });
  costs.push({ label: "Late return risk", amount: rate, type: "maybe", detail: "1hr late = full extra day" });
  costs.push({ label: "Fine processing", amount: 75, type: "maybe", detail: "Per traffic fine" });
  const dep = { economy: 1500, suv: 3000, luxury: 5000 }[type];
  const notes = [`💳 Deposit ~AED ${dep} — refundable within 21 days`, "🚿 Cleaning fee AED 150-500 may apply"];
  if (!t.includes("full cover")) notes.unshift("ℹ️ Basic insurance — excess AED 2,000-5,000 without upgrade");
  return { costs, notes, totalEstimate: costs.reduce((s, c) => s + c.amount, 0), baseTotal: base, depositEstimate: dep };
};

function AnimN({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => { let s = 0; const step = value / 35; const i = setInterval(() => { s += step; if (s >= value) { setD(value); clearInterval(i); } else setD(Math.round(s)); }, 20); return () => clearInterval(i); }, [value]);
  return <span>{d.toLocaleString()}</span>;
}

// ===== THEME (Light — XE/Chrono24 inspired) =====
const T = { bg: "#0A0E14", card: "#141920", card2: "#1A2030", border: "#2A2F3E", accent: "#C8962E", accent2: "#A67A20", text: "#F5EDD6", sub: "#9A9488", dim: "#5A5E68", green: "#1B9E5E", red: "#D94040", blue: "#4A9EFF" };
const costColor = { base: T.green, extra: T.accent, maybe: T.red, opt: T.blue };

// ===== APP =====
export default function App() {
  const [splash, setSplash] = useState(true);
  const [onboard, setOnboard] = useState(() => !localStorage.getItem("rs_onboarded"));
  const [onboardStep, setOnboardStep] = useState(0);
  const [tab, setTab] = useState("scan");
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [followUp, setFollowUp] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState({});
  const [carF, setCarF] = useState("All");
  const [sort, setSort] = useState("price");
  const [cDays, setCDays] = useState(7);
  const [exp, setExp] = useState(null);
  const fRef = useRef();
  const [rental, setRental] = useState({ company: "", car: "", plate: "", emirate: "", start: "", end: "", dailyPrice: "", insurance: "", excess: "", mileage: "", fuel: "", deposit: "", notes: "" });
  const [pickupP, setPickupP] = useState([]);
  const [returnP, setReturnP] = useState([]);
  const [contractP, setContractP] = useState([]);
  const [dType, setDType] = useState(null);
  const [photoMode, setPhotoMode] = useState(null); // null | "pickup" | "return" | "contract"
  const [photoStep, setPhotoStep] = useState(0);
  const [dossierEmail, setDossierEmail] = useState("");
  const shareConsent = true; // Always collect anonymous market data
  const [dossierSaved, setDossierSaved] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const topSafeInset = "env(safe-area-inset-top)";

  useScreenViewport();

  // Splash screen timer
  useEffect(() => { const t = setTimeout(() => setSplash(false), 2200); return () => clearTimeout(t); }, []);

  // Splash Screen
  if (splash) return (
    <div style={{ height: "100%", minHeight: "100%", background: "#0A0E14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <img src="/logo.png" alt="RentScan" style={{ width: "160px", height: "160px", borderRadius: "32px", marginBottom: "28px", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ fontSize: "42px", fontWeight: 800, color: "#F5EDD6", letterSpacing: "-1px" }}>RentScan</div>
      <div style={{ fontSize: "15px", color: "#C8962E", letterSpacing: "4px", textTransform: "uppercase", marginTop: "8px" }}>Rent safely!</div>
      <div style={{ width: "40px", height: "3px", background: "linear-gradient(135deg, #C8962E, #A67A20)", borderRadius: "3px", marginTop: "28px" }} />
      <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }`}</style>
    </div>
  );

  // ===== ONBOARDING SCREENS =====
  const onboardScreens = [
    { icon: "🔍", title: "Scan Your Contract", desc: "Paste any rental quote or contract. Our AI instantly reveals the real total cost — including all hidden fees, Salik tolls, and insurance gaps.", color: T.accent },
    { icon: "📸", title: "Protect Yourself", desc: "Use the guided photo inspection to document the car before you drive away. Timestamped proof that saves you from unfair damage charges.", color: T.green },
    { icon: "🛡️", title: "Rent Safely in Dubai", desc: "Ask any question about renting in Dubai. Get instant, expert answers about insurance, deposits, fuel policies, and your rights.", color: "#4A9EFF" },
  ];

  if (onboard) return (
    <div style={{ height: "100%", minHeight: "100%", background: T.bg, display: "flex", flexDirection: "column", fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "80px", marginBottom: "32px" }}>{onboardScreens[onboardStep].icon}</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: T.text, margin: "0 0 16px", letterSpacing: "-0.5px" }}>{onboardScreens[onboardStep].title}</h1>
        <p style={{ fontSize: "16px", color: T.sub, lineHeight: 1.7, maxWidth: "320px", margin: 0 }}>{onboardScreens[onboardStep].desc}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
        {onboardScreens.map((_, i) => (
          <div key={i} style={{ width: i === onboardStep ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === onboardStep ? onboardScreens[onboardStep].color : T.border, transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ padding: "0 32px 48px" }}>
        {onboardStep < 2 ? (
          <button onClick={() => setOnboardStep(s => s + 1)} style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Next</button>
        ) : (
          <button onClick={() => { setOnboard(false); localStorage.setItem("rs_onboarded", "1"); }} style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Start Scanning →</button>
        )}
        {onboardStep < 2 && (
          <button onClick={() => { setOnboard(false); localStorage.setItem("rs_onboarded", "1"); }} style={{ background: "none", border: "none", color: T.dim, fontSize: "14px", cursor: "pointer", width: "100%", marginTop: "12px", padding: "8px" }}>Skip</button>
        )}
      </div>
    </div>
  );

  // ===== ANALYTICS EVENTS =====
  const trackEvent = (name, params = {}) => {
    try { if (window.gtag) window.gtag("event", name, params); } catch {}
    try { if (window.OneSignal) window.OneSignal.push(function() { window.OneSignal.sendTag(name, "true"); }); } catch {}
  };

  // ===== FOLLOW-UP CHAT =====
  const handleFollowUp = async () => {
    if (!followUp.trim() || followUpLoading) return;
    const newMessages = [...chatMessages, { role: "user", content: followUp.trim() }];
    setChatMessages(newMessages);
    setFollowUp("");
    setFollowUpLoading(true);
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await resp.json();
      if (data.answer) {
        const clean = data.answer.replace(/```json\s*null\s*```/g, "").trim();
        setChatMessages([...newMessages, { role: "assistant", content: clean }]);
      }
    } catch (err) {
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  // ===== SCAN with API =====
  const doScan = async () => {
    setChatMessages([]);
    setFollowUp("");
    if (!text.trim()) return;
    setLoading(true);
    trackEvent("scan_started", { length: text.length });
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: text })
      });
      const data = await resp.json();
      if (data.answer) {
        setRes({ mode: "chat", answer: data.answer, tips: data.tips || [], aiPowered: true });
          setChatMessages([{ role: "user", content: text }, { role: "assistant", content: data.answer }]);
          if (data.termsUsed) setRes(prev => ({ ...prev, termsUsed: data.termsUsed }));
      } else if (data.error) {
        setRes({ mode: "chat", answer: "Sorry, something went wrong. Please try again.", tips: [], aiPowered: false });
      } else {
        setRes({ mode: "chat", answer: "Sorry, I couldn't analyze that. Try pasting a rental quote or asking a question about car rentals in Dubai.", tips: [], aiPowered: false });
      }
    } catch {
      setRes({ mode: "chat", answer: "Could not connect to the AI. Please check your internet connection and try again.", tips: [], aiPowered: false });
    }
    setLoading(false);
  };

  // Extract data from contract photo
  const extractContract = async (imageData) => {
    try {
      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await resp.json();
      if (data.success && data.data) {
        const d = data.data;
        setRental(prev => ({
          ...prev,
          company: d.company || prev.company,
          car: d.car || prev.car,
          plate: d.plate || prev.plate,
          start: d.start || prev.start,
          end: d.end || prev.end,
          dailyPrice: d.dailyPrice ? String(d.dailyPrice) : prev.dailyPrice,
          insurance: d.insurance || prev.insurance,
          excess: d.excess ? String(d.excess) : prev.excess,
          mileage: d.mileage || prev.mileage,
          fuel: d.fuel || prev.fuel,
          deposit: d.deposit ? String(d.deposit) : prev.deposit,
          notes: d.notes ? (prev.notes ? prev.notes + "\n" + d.notes : d.notes) : prev.notes,
        }));
      }
    } catch {}
  };

  const doFile = (e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setText(ev.target.result); r.readAsText(f); } };

  const handleGuidedPhoto = (setter, step) => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment";
    inp.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = (ev) => {
        const guide = PHOTO_GUIDES[step];
        const isCloseUp = guide?.id.includes("close") || guide?.id === "wheels" || guide?.id === "damage" || guide?.id === "roof";
        setter(p => [...p, { id: Date.now() + Math.random(), data: ev.target.result, time: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }), label: guide?.label || "Photo" }]);
        // Close-up steps: stay on same step (user clicks Next when done)
        // Overview steps: auto-advance
        if (!isCloseUp) setPhotoStep(step + 1);
      }; r.readAsDataURL(file);
    }; inp.click();
  };

  const handleContractPhoto = () => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.multiple = true;
    inp.onchange = (e) => Array.from(e.target.files).forEach(file => {
      const r = new FileReader(); r.onload = (ev) => {
        const imageData = ev.target.result;
        setContractP(p => [...p, { id: Date.now() + Math.random(), data: imageData, time: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }), label: "Contract" }]);
        setExtracting(true);
        fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        })
          .then(r => r.json())
          .then(result => {
            if (result.success && result.data) {
              const d = result.data;
              setRental(prev => ({
                ...prev,
                company: d.company || prev.company,
                car: d.car || prev.car,
                plate: d.plate || prev.plate,
                start: d.start || prev.start,
                end: d.end || prev.end,
                dailyPrice: d.dailyPrice ? String(d.dailyPrice) : prev.dailyPrice,
                insurance: d.insurance || prev.insurance,
                excess: d.excess ? String(d.excess) : prev.excess,
                mileage: d.mileage || prev.mileage,
                fuel: d.fuel || prev.fuel,
                deposit: d.deposit ? String(d.deposit) : prev.deposit,
                notes: d.notes ? (prev.notes ? prev.notes + "\n" + d.notes : d.notes) : prev.notes,
              }));
            }
            setExtracting(false);
          })
          .catch(() => setExtracting(false));
      }; r.readAsDataURL(file);
    }); inp.click();
  };

  const handlePhoto = (setter) => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.multiple = true;
    inp.onchange = (e) => Array.from(e.target.files).forEach(file => {
      const r = new FileReader(); r.onload = (ev) => setter(p => [...p, { id: Date.now() + Math.random(), data: ev.target.result, time: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }), label: "Photo" }]); r.readAsDataURL(file);
    }); inp.click();
  };

  // ===== STYLES (Light theme) =====
  const css = {
    page: { minHeight: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", background: T.bg, fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased", paddingTop: topSafeInset, boxSizing: "border-box", width: "100%", maxWidth: "100%", overflow: "visible" },
    wrap: { flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto", padding: "16px 16px calc(84px + env(safe-area-inset-bottom))", overflowX: "hidden", overflowY: "visible" },
    card: { background: T.card, borderRadius: "16px", padding: "18px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" },
    btn: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "0.2px" },
    btnSm: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
    input: { width: "100%", background: T.card, border: `1.5px solid ${T.border}`, borderRadius: "12px", padding: "12px 14px", color: T.text, fontSize: "16px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    tag: (c) => ({ display: "inline-flex", background: `${c}10`, color: c, border: `1px solid ${c}25`, borderRadius: "6px", padding: "3px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }),
    pill: (on) => ({ background: on ? T.accent : T.card, color: on ? "#fff" : T.sub, border: on ? "none" : `1.5px solid ${T.border}`, borderRadius: "10px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }),
    h2: { fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2, margin: "0 0 10px", color: T.text },
    sub: { color: T.sub, fontSize: "14px", lineHeight: 1.5 },
    label: { fontSize: "10px", color: T.dim, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "8px", fontWeight: 600 },
  };

  // ===== BOTTOM NAV (XE-style) =====
  const Nav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,14,20,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, zIndex: 100, padding: "6px 0 max(env(safe-area-inset-bottom), 6px)" }}>
      <div style={{ display: "flex", maxWidth: "720px", margin: "0 auto", justifyContent: "space-around" }}>
        {[["scan", "🔍", "Scan"], ["rental", "📋", "My Rental"]].map(([k, ico, lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "22px", opacity: tab === k ? 1 : 0.35, transition: "opacity 0.2s" }}>{ico}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: tab === k ? T.accent : T.dim, letterSpacing: "0.3px" }}>{lbl}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px", paddingBottom: "16px", borderBottom: `1px solid ${T.border}` }}>
      <img src="/logo.png" alt="RentScan" style={{ width: "38px", height: "38px", borderRadius: "10px" }} />
      <div><div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", color: T.text }}>RentScan</div><div style={{ fontSize: "9px", color: T.accent, letterSpacing: "2px", textTransform: "uppercase", marginTop: "-1px" }}>Rent safely!</div></div>
    </div>
  );

  // ===== GUIDED PHOTO FLOW =====
  const GuidedPhotoFlow = ({ setter }) => {
    const guide = PHOTO_GUIDES[photoStep];
    const total = PHOTO_GUIDES.length;
    const progress = ((photoStep) / total) * 100;
    const isCloseUp = guide?.id.includes("close") || guide?.id === "wheels" || guide?.id === "damage" || guide?.id === "roof";
    const isDone = photoStep >= total;

    if (isDone) return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0A0E14", zIndex: 200, display: "flex", flexDirection: "column", fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Inspection complete</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: `${T.green}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: T.text, margin: "0 0 12px" }}>{photoStep} photos taken</h2>
          <p style={{ fontSize: "16px", color: T.sub, lineHeight: 1.7, maxWidth: "320px", margin: "0 0 8px" }}>Did you find any additional scratches, dents, or damage that you want to photograph?</p>
          <p style={{ fontSize: "14px", color: T.dim, lineHeight: 1.5, maxWidth: "300px" }}>Tip: Even tiny marks matter. Rental companies can charge AED 500+ for a scratch you didn't document.</p>
        </div>
        <div style={{ padding: "16px 24px 36px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => handlePhoto(setter)} style={{ background: `linear-gradient(135deg, #C8962E, #A67A20)`, color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: 700, cursor: "pointer", width: "100%" }}>⚠️ Yes, add more damage photos</button>
          <button onClick={() => { setPhotoMode(null); setPhotoStep(0); }} style={{ background: `linear-gradient(135deg, ${T.green}, #15803D)`, color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: 700, cursor: "pointer", width: "100%" }}>✅ No, I'm done — looks good</button>
        </div>
      </div>
    );

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#0A0E14", zIndex: 200, display: "flex", flexDirection: "column", fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => { setPhotoMode(null); setPhotoStep(0); }} style={{ background: "none", border: "none", fontSize: "15px", color: T.accent, fontWeight: 600, cursor: "pointer" }}>Close</button>
          <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{photoMode === "pickup" ? "Pickup" : "Return"} Inspection</span>
          <span style={{ fontSize: "13px", color: T.sub }}>{photoStep + 1}/{total}</span>
        </div>
        <div style={{ height: "3px", background: T.border }}><div style={{ height: "100%", width: `${progress}%`, background: T.accent, transition: "width 0.3s ease", borderRadius: "0 3px 3px 0" }} /></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px", textAlign: "center" }}>
          {isCloseUp && <div style={{ background: "#C8962E20", border: "1px solid #C8962E", borderRadius: "10px", padding: "8px 16px", marginBottom: "16px", fontSize: "13px", fontWeight: 700, color: "#C8962E" }}>CLOSE-UP — Look carefully for scratches</div>}
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>{guide.icon}</div>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: T.text, margin: "0 0 12px", letterSpacing: "-0.5px" }}>{guide.label}</h2>
          <p style={{ fontSize: "15px", color: T.sub, lineHeight: 1.7, maxWidth: "320px", margin: "0" }}>{guide.tip}</p>
          <div style={{ display: "flex", gap: "5px", margin: "24px 0", flexWrap: "wrap", justifyContent: "center" }}>
            {PHOTO_GUIDES.map((g, i) => (
              <div key={i} style={{ width: i === photoStep ? "20px" : "8px", height: "8px", borderRadius: "4px", background: i < photoStep ? T.green : i === photoStep ? T.accent : T.border, transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 24px 36px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => handleGuidedPhoto(setter, photoStep)} style={{ background: isCloseUp ? `linear-gradient(135deg, #C8962E, #A67A20)` : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "17px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
            {isCloseUp ? "🔎 Take close-up photo" : "📸 Take photo"} — {guide.label}
          </button>
          {isCloseUp && <p style={{ fontSize: "12px", color: T.dim, textAlign: "center", margin: "0" }}>Take as many photos as needed — every scratch counts</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            {photoStep > 0 && <button onClick={() => setPhotoStep(s => s - 1)} style={{ flex: 1, background: T.card, color: T.sub, border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>← Back</button>}
            <button onClick={() => setPhotoStep(s => s + 1)} style={{ flex: 1, background: isCloseUp ? T.green : T.card, color: isCloseUp ? "#fff" : T.sub, border: "none", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>{isCloseUp ? "✓ Done, next →" : "Skip →"}</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== PHOTO SECTION =====
  const Photos = ({ title, icon, photos, setter, guides, type }) => (
    <div style={css.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700 }}>{icon} {title}</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: photos.length > 0 ? T.green : T.dim, background: photos.length > 0 ? `${T.green}10` : T.card, padding: "4px 12px", borderRadius: "8px" }}>{photos.length} photos</span>
      </div>
      {photos.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "14px" }}>
        {photos.map(p => <div key={p.id} style={{ position: "relative", borderRadius: "10px", overflow: "visible", aspectRatio: "1" }}>
          <img src={p.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "8px 4px 3px" }}>
            <div style={{ fontSize: "8px", color: "#fff", textAlign: "center", fontWeight: 600 }}>{p.label}</div>
            <div style={{ fontSize: "7px", color: "#bbb", textAlign: "center" }}>{p.time}</div>
          </div>
          <button onClick={() => setter(pr => pr.filter(x => x.id !== p.id))} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>)}
      </div>}
      {guides ? (
        <div>
          <button onClick={() => { setPhotoMode(type); setPhotoStep(0); }} style={{ ...css.btn, marginBottom: "8px" }}>📸 Start guided inspection ({PHOTO_GUIDES.length} shots)</button>
          <button onClick={() => handlePhoto(setter)} style={{ background: "none", border: `1.5px solid ${T.border}`, color: T.sub, borderRadius: "12px", padding: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "center" }}>Or add photos manually</button>
        </div>
      ) : (
        <button onClick={() => handlePhoto(setter)} style={css.btn}>📸 {photos.length === 0 ? "Take Photos" : "Add More"}</button>
      )}
    </div>
  );

  // ===== SCAN TAB =====
  const ScanTab = () => !res ? (
    <>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h2 style={css.h2}><span style={{ color: T.accent }}>Scan</span> your rental<br />contract</h2>
        <p style={css.sub}>Paste a quote, upload a contract, or ask anything about renting in Dubai.</p>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Paste your rental quote here...\n\nExample: "Toyota Corolla, AED 150/day, 7 days, basic CDW, 250km/day, airport pickup"'} style={{ ...css.input, minHeight: "120px", resize: "vertical", lineHeight: 1.6 }} />
      <button onClick={doScan} disabled={!text.trim() || loading} style={{ ...css.btn, marginTop: "14px", fontSize: "17px", padding: "16px", opacity: text.trim() ? 1 : 0.4 }}>
        {loading ? "🔍 Scanning..." : "🔍 Scan / Ask"}
      </button>
      <div onDragOver={e => e.preventDefault()} onDrop={doFile} onClick={() => fRef.current?.click()} style={{ border: `1.5px dashed ${T.border}`, borderRadius: "12px", padding: "14px", textAlign: "center", cursor: "pointer", marginTop: "14px", background: "transparent" }}>
        <input ref={fRef} type="file" onChange={doFile} style={{ display: "none" }} />
        <span style={{ color: T.dim, fontSize: "13px" }}>📄 Or upload a contract file</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
        {["🔒 Private", "⚡ AI-Powered", "🆓 Free"].map(b => <span key={b} style={{ fontSize: "11px", color: T.dim }}>{b}</span>)}
      </div>
    </>
  ) : (
    <>
      <button onClick={() => { setRes(null); setText(""); }} style={{ background: "none", border: `1.5px solid ${T.border}`, color: T.sub, borderRadius: "10px", padding: "8px 18px", cursor: "pointer", fontSize: "13px", marginBottom: "12px" }}>← New scan</button>
      {res.aiPowered && <div style={{ textAlign: "center", marginBottom: "8px" }}><span style={css.tag(T.green)}>✨ AI-Powered</span></div>}

      {/* CHAT MODE */}
      {res.mode === "chat" && <>
        <div style={{ ...css.card, padding: "22px" }}>
          <div style={{ fontSize: "15px", lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{res.answer.replace(/```json\s*null\s*```/g, "").trim()}</div>

            {res.termsUsed && (
              <div style={{
                marginTop: "14px", padding: "12px 16px", borderRadius: "10px",
                backgroundColor: res.termsUsed.ageDays > 60 ? "rgba(255,100,50,0.1)" : res.termsUsed.ageDays > 14 ? "rgba(255,200,50,0.1)" : "rgba(100,200,100,0.07)",
                border: res.termsUsed.ageDays > 60 ? "1px solid rgba(255,100,50,0.25)" : res.termsUsed.ageDays > 14 ? "1px solid rgba(255,200,50,0.2)" : "1px solid rgba(100,200,100,0.15)",
                fontSize: "12px", lineHeight: 1.5, color: "#999",
              }}>
                <span style={{ fontWeight: 700, color: res.termsUsed.ageDays > 60 ? "#ff6432" : res.termsUsed.ageDays > 14 ? "#e8b930" : "#7cb87c" }}>
                  {res.termsUsed.ageDays > 60 ? "\u26A0\uFE0F Data may be outdated" : res.termsUsed.ageDays > 14 ? "\u26A0\uFE0F Verify with company" : "\u2705 Recently reviewed"}
                </span>
                {" \u2014 Based on "}{res.termsUsed.company}{"'s terms, reviewed "}{res.termsUsed.date}
                {". Terms can change \u2014 verify with the company before signing."}
                {res.termsUsed.url && (<>{" "}<a href={res.termsUsed.url} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A227", textDecoration: "underline" }}>View source</a></>)}
              </div>
            )}

            {/* Follow-up messages */}
            {chatMessages.slice(2).map((msg, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                marginTop: "12px",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "rgba(255, 204, 0, 0.12)" : "rgba(255,255,255,0.04)",
                border: msg.role === "user" ? "1px solid rgba(255,204,0,0.25)" : "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                lineHeight: 1.7,
                color: T.text,
              }}>
                <div style={{ fontSize: "11px", color: msg.role === "user" ? T.accent : "#888", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                  {msg.role === "user" ? "You" : "RentScan AI"}
                </div>
                {msg.content}
              </div>
            ))}

            {/* Follow-up input */}
            {res && res.aiPowered && (
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
                  placeholder="Ask a follow-up question..."
                  disabled={followUpLoading}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: T.text,
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={followUpLoading || !followUp.trim()}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    background: followUpLoading ? "#555" : "linear-gradient(135deg, " + T.accent + ", " + T.accent2 + ")",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: followUpLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {followUpLoading ? "..." : "Ask"}
                </button>
              </div>
            )}
        </div>
        {res.tips?.length > 0 && <div style={css.card}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>💡 Quick tips</h3>
          {res.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.5, paddingTop: "2px" }}>{tip}</div>
            </div>
          ))}
        </div>}
      </>}
    </>
  );

  // ===== COMPARE TAB =====
  const CompareTab = () => {
    const list = COMPANIES.map(co => {
      const cars = carF === "All" ? co.cars : co.cars.filter(c => c.type === carF);
      if (!cars.length) return null;
      const ch = cars.reduce((a, b) => a.perDay < b.perDay ? a : b);
      return { ...co, matchCars: cars, cheapest: ch, tt: calcTrue(ch, co, cDays) };
    }).filter(Boolean).sort((a, b) => sort === "price" ? a.tt - b.tt : sort === "rating" ? b.rating - a.rating : (b.allIn ? 1 : 0) - (a.allIn ? 1 : 0));

    const Pill = ({ on, onClick, children }) => <button onClick={onClick} style={css.pill(on)}>{children}</button>;
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={css.h2}>Compare <span style={{ color: T.accent }}>&amp; rent</span></h2>
          <p style={css.sub}>Estimated totals including all standard fees.</p>
        </div>
        <div style={{ ...css.card, padding: "16px" }}>
          <div style={{ marginBottom: "14px" }}><div style={css.label}>Car type</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["All", "Economy", "SUV", "Luxury"].map(c => <Pill key={c} on={carF === c} onClick={() => setCarF(c)}>{c === "All" ? "🚘 All" : c === "Economy" ? "🚗 Economy" : c === "SUV" ? "🚙 SUV" : "🏎️ Luxury"}</Pill>)}
          </div></div>
          <div style={{ marginBottom: "14px" }}><div style={css.label}>Duration</div><div style={{ display: "flex", gap: "6px" }}>
            {[1, 3, 7, 14, 30].map(d => <Pill key={d} on={cDays === d} onClick={() => setCDays(d)}>{d === 30 ? "1 month" : `${d} day${d > 1 ? "s" : ""}`}</Pill>)}
          </div></div>
          <div><div style={css.label}>Sort by</div><div style={{ display: "flex", gap: "6px" }}>
            {[["price", "💰 Price"], ["rating", "⭐ Rating"], ["allIn", "✅ All-in"]].map(([k, l]) => <Pill key={k} on={sort === k} onClick={() => setSort(k)}>{l}</Pill>)}
          </div></div>
        </div>
        <div style={{ fontSize: "12px", color: T.dim, marginBottom: "12px" }}>{list.length} companies</div>
        {list.map((co, idx) => {
          const isExp = exp === co.id; const extra = co.tt - co.cheapest.perDay * cDays;
          return (
            <div key={co.id} style={{ ...css.card, padding: 0, overflow: "visible", border: idx === 0 ? `2px solid ${T.accent}` : `1px solid ${T.border}` }}>
              {idx === 0 && <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, padding: "5px", textAlign: "center", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "#fff" }}>🏆 BEST DEAL</div>}
              <div style={{ padding: "16px", cursor: "pointer" }} onClick={() => setExp(isExp ? null : co.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "34px" }}>{co.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700 }}>{co.name}</span>
                      {co.verified && <span style={css.tag(T.green)}>✓ Verified</span>}
                      <span style={css.tag(co.allIn ? T.blue : T.accent2)}>{co.allIn ? "All-in" : "Extras apply"}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: T.sub, marginTop: "4px" }}>⭐ {co.rating} ({co.reviews.toLocaleString()}) · 📍 {co.location.split(",")[0]}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: T.dim }}>Est. total</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: idx === 0 ? T.green : T.accent }}>{co.tt.toLocaleString()}</div>
                    <div style={{ fontSize: "10px", color: extra > 50 ? T.accent2 : T.green }}>{extra > 50 ? `+${extra}` : "✓ All-in"}</div>
                  </div>
                </div>
              </div>
              {isExp && <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px", background: T.card2 }}>
                <div style={css.label}>Available cars</div>
                {co.matchCars.map((car, ci) => (
                  <div key={ci} style={{ display: "flex", alignItems: "center", padding: "12px", background: "#0A0E14", borderRadius: "12px", marginBottom: "8px", gap: "12px", border: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: "28px" }}>{car.img}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{car.model}</div>
                      <div style={{ fontSize: "10px", color: T.sub, marginTop: "3px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span>🛡️ {car.insurance}</span><span>📏 {car.mileage}</span>
                        <span style={{ color: car.fuel.includes("Not") ? T.red : T.sub }}>⛽ {car.fuel}</span>
                        {car.salikIncl && <span style={{ color: T.green }}>✓ Salik</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: T.dim }}>{car.perDay}/day</div>
                      <div style={{ fontSize: "17px", fontWeight: 700, color: T.accent }}>AED {calcTrue(car, co, cDays).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "14px 0" }}>
                  <div><div style={{ fontSize: "11px", color: T.green, fontWeight: 700, marginBottom: "6px" }}>✅ INCLUDES</div>{co.pros.map((p, i) => <div key={i} style={{ fontSize: "11px", color: T.sub, padding: "2px 0" }}>+ {p}</div>)}</div>
                  <div><div style={{ fontSize: "11px", color: T.accent2, fontWeight: 700, marginBottom: "6px" }}>ℹ️ GOOD TO KNOW</div>{co.cons.map((c, i) => <div key={i} style={{ fontSize: "11px", color: T.dim, padding: "2px 0" }}>• {c}</div>)}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: T.dim, margin: "10px 0 14px", flexWrap: "wrap" }}>
                  <span>💳 Deposit: AED {co.deposit.toLocaleString()}</span>
                  <span>{co.delivery ? "🚗 Free delivery" : "📍 Pickup only"}</span>
                </div>
                <button onClick={() => { setLeads(p => ({ ...p, [co.name]: true })); trackEvent("quote_requested", { company: co.name }); }} disabled={leads[co.name]} style={{ ...css.btn, background: leads[co.name] ? T.green : `linear-gradient(135deg, ${T.accent}, ${T.accent2})` }}>
                  {leads[co.name] ? "✓ Quote requested!" : `Get Free Quote from ${co.name}`}
                </button>
                {leads[co.name] && <p style={{ fontSize: "12px", color: T.green, textAlign: "center", marginTop: "8px" }}>📱 They'll contact you within 2 hours</p>}
              </div>}
            </div>);
        })}
        <p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "20px 0", lineHeight: 1.6 }}>🔍 Estimates include Salik, insurance, mileage and airport fees.<br />Prices are indicative. We may earn a referral fee.</p>
      </>
    );
  };

  // ===== RENTAL TAB =====
  const RentalTab = () => {
    const total = pickupP.length + returnP.length + contractP.length;
    const hasStarted = rental.company || rental.car || total > 0;
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={css.h2}>My <span style={{ color: T.accent }}>Rental Dossier</span></h2>
          <p style={css.sub}>Your evidence if anything goes wrong.</p>
        </div>

        {!hasStarted && (
          <div style={{ ...css.card, border: `1px solid ${T.accent}30`, marginBottom: "20px" }}>
            <div style={{ display: "grid", gap: "16px", textAlign: "left" }}>
              {[
                ["📝", "Upload your contract", "Take a photo of your contract. Our AI reads it and fills in all details automatically."],
                ["📸", "Take guided photos at pickup", "16 shots covering every angle. Timestamped proof."],
                ["📋", "Generate your dossier", "One PDF with all details and photos. Your protection."],
              ].map(([ico, title, desc]) => (
                <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}>{ico}</div>
                  <div><div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: "2px" }}>{title}</div><div style={{ fontSize: "12px", color: T.sub, lineHeight: 1.5 }}>{desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {total > 0 && <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "24px" }}>
          {[[`${total}`, "Photos"], [pickupP.length > 0 ? "✓" : "—", "Pickup"], [returnP.length > 0 ? "✓" : "—", "Return"], [contractP.length > 0 ? "✓" : "—", "Docs"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: v === "✓" ? T.green : v === "—" ? T.dim : T.accent }}>{v}</div>
              <div style={{ fontSize: "9px", color: T.dim, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
            </div>))}
        </div>}

        <div style={css.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700 }}>📄 Contract & Documents</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: contractP.length > 0 ? T.green : T.dim, background: contractP.length > 0 ? T.green + "10" : T.card, padding: "4px 12px", borderRadius: "8px" }}>{contractP.length} photos</span>
          </div>
          {contractP.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "14px" }}>
            {contractP.map(p => <div key={p.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "1" }}>
              <img src={p.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "8px 4px 3px" }}>
                <div style={{ fontSize: "8px", color: "#fff", textAlign: "center", fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: "7px", color: "#bbb", textAlign: "center" }}>{p.time}</div>
              </div>


        <button onClick={() => setContractP(pr => pr.filter(x => x.id !== p.id))} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>)}
          </div>}
          {extracting && <div style={{ background: T.accent + "15", border: "1px solid " + T.accent, borderRadius: "12px", padding: "12px", marginBottom: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: T.accent, fontWeight: 600 }}>🔍 Reading contract... auto-filling details</span>
          </div>}
          <button onClick={handleContractPhoto} style={{ ...css.btn, marginBottom: "8px" }}>📸 {contractP.length === 0 ? "Upload Contract Photo" : "Add More Pages"}</button>
          <p style={{ fontSize: "11px", color: T.dim, textAlign: "center" }}>AI reads your contract and auto-fills rental details</p>
        </div>

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px" }}>🚗 Rental Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[["company", "Company"], ["car", "Car model"], ["plate", "Plate number"], ["emirate", "Emirate"], ["start", "Start date"], ["end", "End date"], ["dailyPrice", "Daily price (AED)"], ["deposit", "Deposit (AED)"], ["insurance", "Insurance"], ["excess", "Excess (AED)"], ["mileage", "Mileage limit"], ["fuel", "Fuel policy"]].map(([k, l]) => (
              <div key={k}><input value={rental[k]} onChange={e => setRental(p => ({ ...p, [k]: e.target.value }))} placeholder={l} style={{ ...css.input, height: "48px", lineHeight: "48px", padding: "0 14px", WebkitAppearance: "none" }} type="text" /></div>
            ))}
          </div>
          <div style={{ marginTop: "10px" }}><textarea value={rental.notes} onChange={e => setRental(p => ({ ...p, notes: e.target.value }))} placeholder="Notes..." style={{ ...css.input, minHeight: "50px", resize: "vertical" }} /></div>
        </div>
        <Photos title="Pickup Inspection" icon="🟢" photos={pickupP} setter={setPickupP} guides={true} type="pickup" />
        <Photos title="Return Inspection" icon="🔴" photos={returnP} setter={setReturnP} guides={true} type="return" />

        {/* DOSSIER GENERATION */}
        <div style={{ ...css.card, border: `2px solid ${T.accent}` }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>📋 Pickup Dossier</h3>
          <p style={{ ...css.sub, fontSize: "12px", marginBottom: "14px" }}>Generate before you drive away. Proves the car's condition when you received it.</p>

          <div style={{ marginBottom: "12px" }}>
            <div style={css.label}>Your email (optional)</div>
            <input value={dossierEmail} onChange={e => setDossierEmail(e.target.value)} placeholder="your@email.com" style={css.input} type="email" />
          </div>


          <button onClick={() => {
            if (rental.company) {
              trackEvent("rental_data", {
                company: rental.company, car: rental.car, dailyPrice: rental.dailyPrice || "",
                insurance: rental.insurance, mileage: rental.mileage, fuel: rental.fuel,
                deposit: rental.deposit, start: rental.start, end: rental.end, pickupPhotos: pickupP.length,
              });
            }

            const d = rental;
            const dossierDate = new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "long", timeStyle: "short" });
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RentScan Pickup Dossier - ${d.company || "Rental"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;color:#1A1A2E;padding:32px;max-width:800px;margin:0 auto}
h1{font-size:28px;font-weight:800;margin-bottom:4px}
h2{font-size:18px;font-weight:700;margin:24px 0 12px;padding-bottom:8px;border-bottom:2px solid #C8962E}
.sub{color:#6B6B80;font-size:13px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.field{background:#141920;border-radius:8px;padding:10px 14px}
.field .label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9D9DB0;font-weight:600}
.field .value{font-size:15px;font-weight:600;margin-top:2px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
.photo{border-radius:8px;overflow:hidden}
.photo img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.photo .info{padding:6px;background:#141920;font-size:10px;color:#6B6B80;text-align:center}
.photo .info strong{display:block;color:#1A1A2E;font-size:11px}
.notice{background:#C8962E20;border:1px solid #C8962E;border-radius:8px;padding:14px;margin:20px 0;font-size:13px;color:#C8962E;line-height:1.5}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E8E8ED;text-align:center;color:#9D9DB0;font-size:11px}
.badge{display:inline-block;background:#C8962E;color:#fff;padding:3px 10px;border-radius:6px;font-size:10px;font-weight:700}
@media print{body{padding:16px}img{page-break-inside:avoid}}
</style></head><body>
<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
<div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#C8962E,#A67A20);display:flex;align-items:center;justify-content:center;font-size:22px">🔍</div>
<div><h1>Pickup Dossier</h1><div class="sub" style="margin:0">Generated ${dossierDate}</div></div>
</div>
<div class="sub">This document records the condition of the vehicle at the time of pickup.</div>

<h2>Rental Details</h2>
<div class="grid">
${[["Company", d.company], ["Car model", d.car], ["Plate number", d.plate], ["Pickup date", d.start], ["Return date", d.end], ["Daily price", d.dailyPrice ? "AED " + d.dailyPrice : "\u2014"], ["Insurance", d.insurance], ["Excess", d.excess ? "AED " + d.excess : "\u2014"], ["Mileage limit", d.mileage], ["Fuel policy", d.fuel], ["Deposit", d.deposit ? "AED " + d.deposit : "\u2014"]].map(([l, v]) => `<div class="field"><div class="label">${l}</div><div class="value">${v || "\u2014"}</div></div>`).join("")}
</div>
${d.notes ? `<div class="field" style="margin-bottom:16px"><div class="label">Notes</div><div class="value">${d.notes}</div></div>` : ""}

${contractP.length > 0 ? `<h2>Contract Documents</h2>
<p style="color:#6B6B80;font-size:12px;margin-bottom:8px">${contractP.length} photo${contractP.length > 1 ? "s" : ""}</p>
<div class="photos">${contractP.map(p => `<div class="photo"><img src="${p.data}"/><div class="info"><strong>${p.label}</strong>${p.time}</div></div>`).join("")}</div>` : ""}

${pickupP.length > 0 ? `<h2>Vehicle Condition at Pickup</h2>
<p style="color:#6B6B80;font-size:12px;margin-bottom:8px">${pickupP.length} timestamped photo${pickupP.length > 1 ? "s" : ""}</p>
<div class="photos">${pickupP.map(p => `<div class="photo"><img src="${p.data}"/><div class="info"><strong>${p.label}</strong>${p.time}</div></div>`).join("")}</div>` : ""}

<div class="notice"><strong>Notice to rental company:</strong> This dossier documents the vehicle condition at pickup with timestamped photographs. Any pre-existing damage shown above was present before the rental period began. The renter reserves the right to use this documentation in case of disputed charges.</div>

<div class="footer">
<div style="margin-bottom:8px"><span class="badge">RENTSCAN.AE</span></div>
<div>Pickup Dossier generated by RentScan \u2014 Rent safely!</div>
<div>www.rentscan.ae</div>
<div style="margin-top:8px;font-size:10px">Timestamps are based on device time at moment of capture.</div>
</div>
</body></html>`;

            const blob = new Blob([html], { type: "text/html" });
            const file = new File([blob], `RentScan-Dossier-${(d.company || "Rental").replace(/\s+/g, "-")}.html`, { type: "text/html" });

            // Store for sharing
            window._dossierFile = file;
            window._dossierHtml = html;
            window._dossierBlob = blob;
            setDossierSaved(true);
            // Save email as lead
            if (dossierEmail) {
              fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dossierEmail, company: rental.company || "" }),
              }).catch(() => {});
            }
            trackEvent("dossier_generated", { company: d.company, photos: pickupP.length + contractP.length });
          }} disabled={!rental.company && pickupP.length === 0} style={{ ...css.btn, opacity: (!rental.company && pickupP.length === 0) ? 0.4 : 1, marginBottom: "10px" }}>
            📋 Generate Pickup Dossier
          </button>

          {dossierSaved && <>
            <p style={{ fontSize: "13px", color: T.green, textAlign: "center", marginBottom: "12px", fontWeight: 600 }}>✅ Dossier ready!</p>


              {/* Save as PDF */}
              <button onClick={() => {
                const url = URL.createObjectURL(window._dossierBlob);
                const w = window.open(url, "_blank");
                if (w) w.onload = () => setTimeout(() => w.print(), 500);
              }} style={{ width: "100%", background: "#0A0E14", border: `1.5px solid ${T.border}`, color: T.sub, borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                📥 Save as PDF
              </button>
          </>}

          {!dossierSaved && <p style={{ fontSize: "11px", color: T.dim, textAlign: "center" }}>Generates a professional dossier with all photos and details</p>}
        </div>

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>⚖️ Need Help With a Dispute?</h3>
          <p style={{ ...css.sub, fontSize: "12px", marginBottom: "14px" }}>Select your issue for step-by-step guidance.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            {[["damage", "📸 Damage charge"], ["deposit", "💳 Deposit issue"], ["overcharge", "💰 Unexpected bill"], ["accident", "🚨 Accident"]].map(([k, l]) => (
              <button key={k} onClick={() => { setDType(dType === k ? null : k); trackEvent("dispute_opened", { type: k }); }} style={{ background: dType === k ? `${T.accent}10` : T.card, color: dType === k ? T.accent : T.sub, border: dType === k ? `1.5px solid ${T.accent}` : `1.5px solid ${T.border}`, borderRadius: "12px", padding: "14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          {dType && DISPUTES[dType] && <div style={{ background: "#0A0E14", border: `1px solid ${T.border}`, borderRadius: "16px", padding: "18px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: T.accent, margin: "0 0 14px" }}>{DISPUTES[dType].title}</h4>
            {DISPUTES[dType].steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <div style={{ minWidth: "26px", height: "26px", borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.5, paddingTop: "3px" }}>{step}</div>
              </div>
            ))}
          </div>}
        </div>

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px" }}>📞 Important Contacts</h3>
          {[["Dubai Police", "901"], ["Emergency", "999"], ["DED Consumer Protection", "600 54 5555"], ["RTA", "8009090"], ["Salik", "800 72545"]].map(([n, num]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, fontSize: "13px" }}>
              <span style={{ color: T.sub }}>{n}</span>
              <a href={`tel:${num}`} style={{ color: T.accent, fontWeight: 600, textDecoration: "none" }}>{num}</a>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "16px 0", lineHeight: 1.6 }}>📸 Photos stored locally on your device. Anonymous rental data (company, car, pricing) is automatically collected to improve RentScan for all users.</p>
      </>
    );
  };

  // ===== LEGAL PAGES =====
  const LegalPage = ({ title, children }) => (
    <>
      <button onClick={() => setTab("scan")} style={{ background: "none", border: `1.5px solid ${T.border}`, color: T.sub, borderRadius: "10px", padding: "8px 18px", cursor: "pointer", fontSize: "13px", marginBottom: "16px" }}>← Back</button>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>{title}</h2>
      <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.8 }}>{children}</div>
    </>
  );

  const TermsPage = () => (
    <LegalPage title="Terms of Use">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>
      <p>By accessing or using RentScan (www.rentscan.ae), you agree to be bound by these Terms of Use. If you do not agree, please do not use the platform.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>1. Nature of service</h3>
      <p>RentScan is an independent informational platform that provides estimated cost calculations and comparisons for car rental services in Dubai, UAE. RentScan is NOT a car rental company, broker, agent, or intermediary. We do not rent, lease, or provide vehicles. We do not enter into rental agreements on behalf of any user or rental company.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>2. Informational purposes only</h3>
      <p>All information, estimates, calculations, comparisons, and AI-generated analyses provided on this platform are for <strong style={{ color: T.text }}>general informational purposes only</strong>. This includes but is not limited to:</p>
      <p>• Estimated total rental costs and fee breakdowns<br/>
      • Company comparisons and pricing data<br/>
      • AI-powered contract analysis and chat responses<br/>
      • Dispute guidance and step-by-step suggestions<br/>
      • Contact information for authorities and services</p>
      <p>None of the above constitutes legal advice, financial advice, professional advice, or a guarantee of any kind.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>3. No guarantees on accuracy</h3>
      <p>While we strive to provide accurate and up-to-date information, RentScan makes <strong style={{ color: T.text }}>no warranties or representations</strong> regarding the accuracy, completeness, reliability, or timeliness of any information displayed. Prices, fees, policies, and terms of rental companies may change at any time without notice. Users should always verify all information directly with the rental company before making any booking or financial decision.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>4. AI-generated content disclaimer</h3>
      <p>RentScan uses artificial intelligence (AI) technology to analyze contracts and answer questions. AI-generated content may contain errors, inaccuracies, or outdated information. AI responses should not be relied upon as a substitute for professional legal, financial, or other expert advice. Users are solely responsible for verifying any AI-generated information before acting upon it.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>5. Third-party services and referrals</h3>
      <p>RentScan may display information about, or provide links to, third-party car rental companies and services. These are independent businesses over which RentScan has no control. RentScan does not endorse, guarantee, or assume responsibility for any third-party products, services, or business practices. Any transaction between you and a third-party rental company is solely between you and that company. RentScan may receive referral fees or commissions from rental companies when users request quotes or make bookings through our platform.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>6. Dispute guidance disclaimer</h3>
      <p>The dispute assistance and step-by-step guidance provided on RentScan is for informational purposes only and does <strong style={{ color: T.text }}>not constitute legal advice</strong>. RentScan is not a law firm, legal service, or consumer protection agency. For legal disputes, users should consult a qualified legal professional licensed in the UAE. References to government agencies (DED, RTA, Dubai Police) are provided for convenience only.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>7. Photo dossier and local storage</h3>
      <p>The "My Rental" dossier feature stores photos and rental information locally on your device. RentScan does not upload, store, or have access to your photos or personal rental details. You are solely responsible for maintaining backups of your data. RentScan is not liable for any data loss. While timestamped photos may support a dispute, RentScan makes no guarantee that any evidence will be accepted by rental companies, insurance providers, courts, or any other party.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Anonymous market data</h3>
      <p>RentScan automatically collects <strong style={{ color: T.text }}>anonymous, non-personal market data</strong> from contract scans and rental details submitted through the platform. This includes company names, vehicle models, daily rates, insurance terms, mileage limits, fuel policies, deposit amounts, and fee structures.</p>
      <p>This data contains no personal information and cannot be used to identify individual users. It is used to improve the accuracy of RentScan's cost estimates, identify pricing patterns, detect hidden fees, and provide better guidance to all users. By using RentScan, you acknowledge and agree that anonymous market data derived from your interactions may be collected and used for these purposes.</p>
      <p>This data may be presented in aggregated form to users (e.g., "average daily rate for this company" or "common hidden fees reported"). Individual submissions are never disclosed.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>9. Limitation of liability</h3>
      <p>To the maximum extent permitted by applicable law, RentScan, its owners, operators, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to:</p>
      <p>• Your use of or inability to use the platform<br/>
      • Any inaccuracies in pricing, estimates, or AI-generated content<br/>
      • Any transactions or disputes with third-party rental companies<br/>
      • Any decisions made based on information provided by RentScan<br/>
      • Any loss of data, photos, or documents<br/>
      • Any unauthorized access to your information</p>
      <p>Your use of RentScan is entirely at your own risk.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>10. Indemnification</h3>
      <p>You agree to indemnify, defend, and hold harmless RentScan and its owners, operators, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising from your use of the platform, your violation of these Terms, or your violation of any rights of a third party.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>11. Company information and neutrality</h3>
      <p>RentScan presents publicly available information about car rental companies in a neutral and factual manner. All data is sourced from public websites, published rates, and user submissions. RentScan does not make qualitative judgments about any company. Rankings and sorting are based on objective criteria (estimated price, publicly available ratings). No company pays for higher organic rankings. Sponsored or featured placements, if any, are clearly labeled.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>12. User conduct</h3>
      <p>Users agree not to misuse the platform, including but not limited to: submitting false information, attempting to manipulate data, using the platform for any unlawful purpose, or interfering with the platform's operation.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>13. Modifications</h3>
      <p>RentScan reserves the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>14. Governing law</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising from these Terms or your use of RentScan shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>15. Contact</h3>
      <p>For questions about these Terms, contact us at: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>
    </LegalPage>
  );

  const PrivacyPage = () => (
    <LegalPage title="Privacy Policy">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>
      <p>This Privacy Policy describes how RentScan (www.rentscan.ae) collects, uses, and protects your information. By using our platform, you consent to the practices described in this policy.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>1. Information we collect</h3>
      <p><strong style={{ color: T.text }}>Information you provide:</strong></p>
      <p>• Contract text or rental quotes you paste into the scanner<br/>
      • Questions you type into the AI assistant<br/>
      • Contact information submitted via "Get Quote" forms (name, phone number)<br/>
      • Rental details entered in the "My Rental" dossier</p>
      <p><strong style={{ color: T.text }}>Information collected automatically:</strong></p>
      <p>• <strong style={{ color: T.text }}>Anonymous rental market data:</strong> When you scan a contract or submit rental details, RentScan automatically extracts non-personal market data including company names, vehicle models, daily rates, insurance terms, mileage limits, fuel policies, and fee structures. This data cannot identify you.</p>
      <p>• Basic analytics data (page views, device type, country) via cookies or analytics tools<br/>
      • IP address (anonymized)<br/>
      • Browser type and operating system</p>
      <p><strong style={{ color: T.text }}>Information we do NOT collect:</strong></p>
      <p>• Photos taken in the "My Rental" dossier — these are stored <strong style={{ color: T.text }}>only on your device</strong> and are never uploaded to our servers<br/>
      • Payment information — we do not process payments<br/>
      • Precise GPS location</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>2. How we use your information</h3>
      <p>• <strong style={{ color: T.text }}>Contract analysis:</strong> Text you paste is sent to our AI provider (Anthropic) for analysis and is not stored permanently by RentScan<br/>
      • <strong style={{ color: T.text }}>Lead generation:</strong> If you click "Get Quote", your contact information may be shared with the selected rental company so they can provide you with a quote<br/>
      • <strong style={{ color: T.text }}>Market intelligence:</strong> Anonymous rental data is aggregated to improve cost estimates, identify pricing patterns, and detect common hidden fees across rental companies in Dubai. This helps all users get more accurate analyses.<br/>
      • <strong style={{ color: T.text }}>Analytics:</strong> Aggregated, anonymous usage data to improve our service<br/>
      • <strong style={{ color: T.text }}>Communication:</strong> If you contact us, we may use your information to respond</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>3. Third-party data sharing</h3>
      <p>We may share information with:</p>
      <p>• <strong style={{ color: T.text }}>Anthropic (AI provider):</strong> Contract text and questions are processed via the Anthropic Claude API. Anthropic's privacy policy governs their handling of this data.<br/>
      • <strong style={{ color: T.text }}>Rental companies:</strong> Only when you explicitly request a quote by clicking "Get Quote" and submitting your contact information. We never share your data without your action.<br/>
      • <strong style={{ color: T.text }}>Analytics providers:</strong> Anonymous, aggregated usage data only.<br/>
      • <strong style={{ color: T.text }}>Law enforcement:</strong> If required by UAE law or valid legal process.</p>
      <p>We do <strong style={{ color: T.text }}>not</strong> sell your personal information to third parties.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>4. Data retention</h3>
      <p>• Contract text sent for AI analysis is not permanently stored by RentScan<br/>
      • Lead information (name, phone) is retained until the quote process is completed or for a maximum of 90 days<br/>
      • Anonymous rental market data is retained indefinitely in aggregated form to improve service quality<br/>
      • Analytics data is retained in aggregated, anonymous form<br/>
      • Photos and dossier data exist only on your device — if you clear your browser data, this information is lost</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>5. Data security</h3>
      <p>We implement reasonable technical and organizational measures to protect your information. However, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>6. Your rights</h3>
      <p>You have the right to:</p>
      <p>• Request access to personal data we hold about you<br/>
      • Request deletion of your personal data<br/>
      • Withdraw consent for data processing at any time<br/>
      • Opt out of any marketing communications</p>
      <p>To exercise these rights, contact us at: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>7. Cookies</h3>
      <p>RentScan may use cookies and similar technologies for analytics and functionality purposes. You can control cookie settings through your browser. Disabling cookies may affect platform functionality.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Children's privacy</h3>
      <p>RentScan is not intended for use by individuals under the age of 18. We do not knowingly collect information from children.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>9. International data transfers</h3>
      <p>Your data may be processed outside the UAE (e.g., AI processing via Anthropic's servers). By using RentScan, you consent to such transfers.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>10. Changes to this policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date. Continued use constitutes acceptance.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>11. Contact</h3>
      <p>For privacy-related inquiries: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>
    </LegalPage>
  );

  const DisclaimerPage = () => (
    <LegalPage title="Disclaimer">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>General disclaimer</h3>
      <p>RentScan is an independent informational tool. All content on this platform — including prices, estimates, comparisons, AI-generated analyses, dispute guidance, and company information — is provided "as is" and "as available" without warranties of any kind, whether express or implied.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Not legal advice</h3>
      <p>Nothing on this platform constitutes legal advice. The dispute assistance feature provides general informational guidance only. For legal matters, consult a qualified attorney licensed in the UAE.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Not financial advice</h3>
      <p>Cost estimates and comparisons are approximations based on publicly available data. Actual costs may vary significantly. Do not make financial decisions based solely on RentScan estimates.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>No affiliation</h3>
      <p>RentScan is not affiliated with, endorsed by, or sponsored by any car rental company listed on the platform, nor by any government entity including but not limited to RTA, DED, Dubai Police, or RERA. All trademarks and company names belong to their respective owners.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>AI limitations</h3>
      <p>The AI analysis feature uses third-party artificial intelligence technology. AI can make mistakes, misinterpret data, or provide outdated information. Always verify AI-generated content independently. RentScan is not responsible for any actions taken based on AI output.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Photo evidence</h3>
      <p>While the photo dossier feature helps document vehicle condition, RentScan makes no representation that such documentation will be accepted as evidence by any rental company, insurance provider, court, or other party. The effectiveness of photographic evidence depends on many factors outside RentScan's control.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Market data</h3>
      <p>RentScan collects anonymous market data from user interactions to improve its service. This data is aggregated and non-personal. While RentScan strives to provide accurate market insights based on this data, it makes no guarantees about the completeness or accuracy of aggregated market information. Market conditions change frequently and past data may not reflect current pricing or policies.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Pricing data</h3>
      <p>All pricing information is collected from publicly available sources and may not reflect current rates, promotions, or special conditions. Prices can change without notice. Always confirm the final price directly with the rental company before committing to any booking.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>UAE compliance</h3>
      <p>RentScan operates in compliance with UAE Federal Law and Dubai regulations. Users are responsible for ensuring their own compliance with all applicable laws when renting vehicles in the UAE.</p>
    </LegalPage>
  );

  // ===== FOOTER =====
  const Footer = () => (
    <div style={{ textAlign: "center", padding: "24px 0 16px", borderTop: `1px solid ${T.border}`, marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[["terms", "Terms of Use"], ["privacy", "Privacy Policy"], ["disclaimer", "Disclaimer"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", color: T.dim, fontSize: "11px", cursor: "pointer", textDecoration: "underline", padding: "4px" }}>{l}</button>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: T.dim, margin: 0, lineHeight: 1.5 }}>© 2026 RentScan · Dubai, UAE<br/>All information is for general guidance only. Not legal or financial advice.</p>
    </div>
  );

  return (
    <div style={css.page}>
      {photoMode === "pickup" && <GuidedPhotoFlow setter={setPickupP} />}
      {photoMode === "return" && <GuidedPhotoFlow setter={setReturnP} />}
      <div style={css.wrap}>
        <Logo />
        {tab === "scan" && ScanTab()}
        {tab === "rental" && RentalTab()}
        {tab === "terms" && <TermsPage />}
        {tab === "privacy" && <PrivacyPage />}
        {tab === "disclaimer" && <DisclaimerPage />}
        <Footer />
      </div>
      <Nav />
    </div>
  );
}
