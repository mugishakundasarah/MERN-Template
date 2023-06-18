const router = require("express").Router()
const authRoutes = require("./auth.controller")

router.use("/auth", authRoutes)

router.use('/refresh-token', (req, res) => {
    const refreshToken = req.body.refreshToken;

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY, (err, user) => {
    if (err) {
      // Handle invalid or expired refresh token
      return res.status(401).json({ message: 'Refresh token has expired' });
    }

    // Generate a new access token
    const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_ACCESS_TOKEN_KEY, { expiresIn: '2m' });

    // Send the new access token as a response
    return res.json({ accessToken });
  });
})

module.exports = router

