import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./model/user.model.js";
import Listing from "./model/listing.model.js";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/staybyte";

const sampleUsers = [
  { name: "Aarav Sharma", email: "aarav@example.com", password: "password123" },
  { name: "Meera Kapoor", email: "meera@example.com", password: "password123" },
  { name: "Rohit Singh", email: "rohit@example.com", password: "password123" },
  { name: "Sanya Verma", email: "sanya@example.com", password: "password123" }
];

const sampleListings = [
  {
    hostEmail: "aarav@example.com",
    title: "Oceanfront Glass Villa",
    description: "A serene glass villa with a private plunge pool, sunrise deck, and direct beach access for a luxury coastal getaway.",
    city: "Goa",
    landMark: "Baga Beach",
    category: "Villa",
    rent: 4200,
    ratings: 4.8,
    isBooked: false,
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
  },
  {
    hostEmail: "meera@example.com",
    title: "Forest Cabin Retreat",
    description: "Woodland-inspired cabin with a fireplace, balcony seating, and peaceful mountain views for slow, cozy weekends.",
    city: "Manali",
    landMark: "Old Manali",
    category: "Cabin",
    rent: 2800,
    ratings: 4.6,
    isBooked: false,
    image1: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
  },
  {
    hostEmail: "rohit@example.com",
    title: "Sunset Farmhouse Stay",
    description: "A rustic farmhouse surrounded by orchards and open fields, perfect for family holidays and quiet evenings.",
    city: "Nashik",
    landMark: "Sula Valley",
    category: "Farmhouse",
    rent: 3200,
    ratings: 4.7,
    isBooked: true,
    guestEmail: "sanya@example.com",
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
  },
  {
    hostEmail: "sanya@example.com",
    title: "Lakeview Apartment",
    description: "Bright apartment with a balcony overlooking the lake, designer interiors, and quick access to local cafes.",
    city: "Udaipur",
    landMark: "Lake Pichola",
    category: "Apartment",
    rent: 2600,
    ratings: 4.5,
    isBooked: false,
    image1: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
  },
  {
    hostEmail: "aarav@example.com",
    title: "Hilltop Treehouse",
    description: "A cozy treetop hideaway with warm lighting, open views, and an outdoor lounge ideal for romantic getaways.",
    city: "Coorg",
    landMark: "Madikeri",
    category: "Treehouse",
    rent: 3500,
    ratings: 4.9,
    isBooked: false,
    image1: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80"
  },
  {
    hostEmail: "meera@example.com",
    title: "Cove Beach House",
    description: "Minimal-chic beach house with sun loungers, open kitchen, and direct sunset-facing terrace access.",
    city: "Pondicherry",
    landMark: "Rock Beach",
    category: "Beach House",
    rent: 3900,
    ratings: 4.8,
    isBooked: false,
    image1: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    image2: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    image3: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80"
  }
];

const seedDatabase = async () => {
  await mongoose.connect(mongoUrl);

  await User.deleteMany({});
  await Listing.deleteMany({});

  const hashedUsers = await Promise.all(
    sampleUsers.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    }))
  );

  const createdUsers = await User.insertMany(hashedUsers);
  const userMap = Object.fromEntries(createdUsers.map((user) => [user.email, user._id]));

  const listingsToInsert = sampleListings.map(({ hostEmail, guestEmail, ...listing }) => ({
    ...listing,
    host: userMap[hostEmail],
    guest: guestEmail ? userMap[guestEmail] : undefined
  }));

  const createdListings = await Listing.insertMany(listingsToInsert);

  for (const user of createdUsers) {
    const userListings = createdListings
      .filter((listing) => listing.host.toString() === user._id.toString())
      .map((listing) => listing._id);

    await User.findByIdAndUpdate(user._id, { listing: userListings }, { new: true });
  }

  console.log(`Seeded ${createdUsers.length} users and ${createdListings.length} listings successfully.`);
  console.log(`MongoDB URL used: ${mongoUrl}`);
};

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
