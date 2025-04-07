import express from "express";
import Memcached from "memcached";

const app = express();
app.use(express.json());

const memcached = new Memcached("localhost:11211"); // Change this if Memcached is running on a different host


memcached.stats((err, stats) => {
    if (err) {
      console.error('Memcached connection error:', err);
    } else {
      console.log('Memcached connected. Stats:', stats);
    }
  });

  
// Set cache
app.post("/setCache", (req, res) => {
    const { key, value, lifetime } = req.body;

    if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required!" });
    }

    const expiry = lifetime || 6000; // Default expiry: 60 seconds

    memcached.set(key, value, expiry, (err) => {
        if (err) {
            console.error("Error setting cache:", err);
            return res.status(500).json({ message: "Failed to set cache." });
        }
        res.json({ message: "Cache set successfully!", key, value, expiry });
    });
});

// Get cache
app.get("/getCache/:key", (req, res) => {
    const { key } = req.params;

    memcached.get(key, (err, data) => {
        if (err) {
            console.error("Error getting cache:", err);
            return res.status(500).json({ message: "Failed to get cache." });
        }
        if (data === undefined) {
            return res.json({ message: "Cache miss!", key });
        }
        res.json({ key, value: data });
    });
});

// Delete cache
app.delete("/deleteCache/:key", (req, res) => {
    const { key } = req.params;

    memcached.del(key, (err) => {
        if (err) {
            console.error("Error deleting cache:", err);
            return res.status(500).json({ message: "Failed to delete cache." });
        }
        res.json({ message: "Cache deleted successfully!", key });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Memcached API running on port ${PORT}`);
});
