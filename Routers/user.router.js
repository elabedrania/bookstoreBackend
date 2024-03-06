const express = require("express");
const user = require("../Models/user");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
      const users = await user.find();
      res.status(200).json(users);
      console.log("User found:");



    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch users", details: error.message });
    }
});

router.post("/", async (req, res)=>{
    try {
        const { username, email, password, isAdmin } = req.body;
  
        // Check if the username or email is already in use (customize this check based on your model)
        const existingUser = await User.findOne({
          $or: [{ username }, { email }],
        });
        if (existingUser) {
          return res
            .status(400)
            .json({ error: "Username or email already in use" });
        }
           // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password and isAdmin value
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        isAdmin: Boolean(isAdmin), // Convert isAdmin to a boolean
      });

      // Emit a Socket.IO event to inform clients about the new user
      io.emit("newUser", newUser);

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating a user:", error);
      res
        .status(500)
        .json({ error: "Failed to create a user", details: error.message });
    }
});

router.put("/:userId", async (req, res) => {
    const { userId } = req.params;
    const { username, email, password, addresses, isAdmin } = req.body;
  
    try {
      // Check if the user exists
      const user = await user.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Authorization check should be here
      // Ensure that only authorized users can update the isAdmin property
  
      // Hash the new password if provided
      let hashedPassword;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
  
      // Update the user data
      user.username = username ||user.username;
      user.email = email || user.email;
      user.password = hashedPassword || user.password;
      
      // Update isAdmin if provided
      // Perform type checking to ensure isAdmin is a boolean
      if (isAdmin !== undefined) {
        user.isAdmin = Boolean(isAdmin);
      }
      
      // Update addresses if provided
      if (addresses) {
        user.addresses = addresses;
      }
  
      // Save the updated user
      const updatedUser = await user.save();
  
      // Notify connected clients that a user was updated
      io.emit("userUpdated", updatedUser);
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res
        .status(500)
        .json({ error: "Failed to update user", details: error.message });
    }
});


  // Find a user by ID
  router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      // Find the user by ID
      const user = await user.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch user", details: error.message });
    }
});


