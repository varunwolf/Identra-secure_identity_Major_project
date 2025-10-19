import User from '../models/User.js'

export async function beginRegistration(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // For now, just return a mock response
    res.json({
      challenge: 'mock-challenge',
      rp: {
        name: 'Identra Identity System',
        id: 'localhost'
      },
      user: {
        id: user._id.toString(),
        name: user.email,
        displayName: user.name
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required'
      },
      timeout: 60000,
      attestation: 'direct'
    })
  } catch (err) {
    next(err)
  }
}

export async function completeRegistration(req, res, next) {
  try {
    const { id, rawId, response, type } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Mock successful registration
    const credential = {
      id,
      publicKey: 'mock-public-key',
      counter: 0,
      deviceType: 'platform',
      backedUp: false,
      createdAt: new Date()
    }

    user.biometricCredentials = user.biometricCredentials || []
    user.biometricCredentials.push(credential)
    user.biometricEnabled = true
    await user.save()

    res.json({ 
      message: 'Biometric authentication registered successfully',
      verified: true 
    })
  } catch (err) {
    next(err)
  }
}

export async function beginAuthentication(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user || !user.biometricEnabled || !user.biometricCredentials || user.biometricCredentials.length === 0) {
      return res.status(400).json({ message: 'No biometric credentials found' })
    }

    res.json({
      challenge: 'mock-challenge',
      allowCredentials: user.biometricCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: ['internal']
      })),
      timeout: 60000,
      userVerification: 'required'
    })
  } catch (err) {
    next(err)
  }
}

export async function completeAuthentication(req, res, next) {
  try {
    const { id, rawId, response, type } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Mock successful authentication
    res.json({ 
      message: 'Biometric authentication successful',
      verified: true 
    })
  } catch (err) {
    next(err)
  }
}

export async function getCredentials(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      credentials: user.biometricCredentials || []
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteCredential(req, res, next) {
  try {
    const { credentialId } = req.params
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.biometricCredentials = (user.biometricCredentials || []).filter(
      cred => cred.id !== credentialId
    )

    if (user.biometricCredentials.length === 0) {
      user.biometricEnabled = false
    }

    await user.save()

    res.json({ message: 'Credential deleted successfully' })
  } catch (err) {
    next(err)
  }
}