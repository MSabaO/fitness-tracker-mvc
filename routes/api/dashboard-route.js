const router = require('express').Router();
const { User, Water, Cardio, Sleep, Steps, Workout } = require('../../models');
const { Op } = require('sequelize');
const dayJs = require('dayjs');

const today = dayJs();
const formattedDate = today.format('YYYY-MM-DD')

router.get('/', async (req, res) => {
  console.log(req.session.userId);
  try {
    // If user logged in, include user data
    if (req.session.loggedIn) {
      // Fetch data from models
      const dateInput = req.query.id || formattedDate;
      console.log(dateInput);

      const userData =
        (await User.findOne({ where: { id: req.session.userId } })) || [];

      const cardioArray =
        (await Cardio.findAll({ 
          where: { 
              userId: req.session.userId,
              created_at: {
                [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
              }, 
            } 
        })) || [];
  
      const workoutArray =
        (await Workout.findAll({ 
          where: { 
              userId: req.session.userId,
              created_at: {
                [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
              }, 
            } 
        })) || [];
     
      const waterArray =
      (await Water.findAll({ 
        where: { 
            userId: req.session.userId,
            created_at: {
              [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
            }, 
          } 
      })) || [];

      const waterSum = await Water.sum('amount', {
        where: {
          userId: req.session.userId,
          created_at: {
            [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
          },
        },
      });
      
      const sleepArray =
      (await Sleep.findAll({ 
        where: { 
            userId: req.session.userId,
            created_at: {
              [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
            }, 
          } 
      })) || [];

      const sleepSum = await Sleep.sum('hours', {
        where: {
          userId: req.session.userId,
          created_at: {
            [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
          },
        },
      });
      
      const stepsArray =
      (await Steps.findAll({ 
        where: { 
            userId: req.session.userId,
            created_at: {
              [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
            }, 
          } 
      })) || [];

       const stepsSum = await Steps.sum('amount', {
        where: {
          userId: req.session.userId,
          created_at: {
            [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
          },
        },
      });

      // Pass the data to the EJS template
      res.render('dashboard2', {
        categories: [
          { name: 'User', data: userData },
          { name: 'Cardio', data: cardioArray },
          { name: 'Workout', data: workoutArray },
          { name: 'Water', data: waterArray },
          { name: 'Sleep', data: sleepArray },
          { name: 'Steps', data: stepsArray },
        ],
        userData,
        date: dayJs(dateInput).format('MMMM D, YYYY'),
        cardioArray,
        workoutArray,
        waterArray,
        waterSum: waterSum,
        sleepArray,
        sleepSum: sleepSum,
        stepsArray,
        stepsSum: stepsSum,
      });
    } else {
      res.render('login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// User update
router.post('/user', async (req, res) => {
  try {
    const userId = req.session.passport.user;
    // console.log(userId);
    const user = await User.findByPk(userId);
    // console.log(user);
    await user.update({ weight: req.body.weight, height: req.body.height });
    res.status(200).json(user);
    console.log(user, 'User updated');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

//user delete height
router.delete('/user/height/:id', async (req, res) => {
  try {
    const deleteHeight = await User.update(
      {
      height: null,
      },
      {
      where: {
        id: req.params.id,
      },
      }
    )
    if (!deleteHeight) {
      res.status(404).json({ message: 'Height does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteHeight);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// delete weight
router.delete('/user/weight/:id', async (req, res) => {
  try {
    const deleteWeight = await User.update(
      {
      weight: null,
      },
      {
      where: {
        id: req.params.id,
      },
      }
    )
    if (!deleteWeight) {
      res.status(404).json({ message: 'Weight does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteWeight);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//! water requests
router.post('/water', async (req, res) => {
  console.log('req:', req.body);
  const userId = req.session.passport.user;

  console.log(req.session);
  console.log(userId);

  try {
    const addWater = await Water.create({
      amount: req.body.wtrInput,

      userId: userId,
    });
    return res.redirect('/');
  } catch (error) {
    console.error('Error adding daily water intake:', error);
    return res
      .status(500)
      .json({ message: 'Internal Server Error adding daily water intake!' });
  }
});

// router.put('/water/:id', (req, res) => {

// });

router.delete('/water/:id', async (req, res) => {
  try {
    const deleteWater = await Water.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteWater) {
      res.status(404).json({ message: 'Water does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteWater);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//! sleep requests

router.post('/sleep', async (req, res) => {
  console.log(req.body);
  const userId = req.session.passport.user;
  try {
    const addSleep = await Sleep.create({
      hours: req.body.slpInput,
      userId: userId,
    });
    return res.redirect('/');
  } catch (error) {
    console.error('Error adding daily sleep:', error);
    return res
      .status(500)
      .json({ message: 'Internal Server Error adding daily sleep!' });
  }
});

// Delete Sleep data
router.delete('/sleep/:id', async (req, res) => {
  try {
    const deleteSleep = await Sleep.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteSleep) {
      return res.status(404).json({ message: 'Sleep does not exist!' });
    } else {
      return res.status(200).json(deleteSleep);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//! cardio requests

router.get('/cardio/:id', async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const dateInput = req.params.id;
    console.log(dateInput);
    console.log(userId);

    const cardio = await Cardio.findAll({
      where: {
        userId: userId,
        created_at: {
          [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
        },
      },
    });

    console.log('Cardio data:', cardio);

    if (!cardio) {
      return res.status(404).send('Cardio not found');
    }

    res.status(200).json(cardio);
  } catch (error) {
    console.error('Error processing Cardio data:', error);
    res.status(500).send('Error processing Cardio data');
  }
});

router.post('/cardio', async (req, res) => {
  console.log(req.body);
  const userId = req.session.passport.user;
  try {
    const addCardio = await Cardio.create({
      exercise_name: req.body.exercise,
      distance: req.body.distance,
      time: req.body.time,
      userId: userId,
    });
    return res.redirect('/');
  } catch (error) {
    console.error('Error adding Cardio:', error);
    return res.status(500).json({ message: 'Internal Server Error adding Cardio!' });
  }
});

// router.put('/cardio/:id', (req, res) => {

// });

router.delete('/cardio/:id', async (req, res) => {
  try {
    const deleteCardio = await Cardio.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteCardio) {
      res.status(404).json({ message: 'Cardio does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteCardio);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//! steps requests

router.post('/steps', async (req, res) => {
  console.log(req.body);
  const userId = req.session.passport.user;
  try {
    const addSteps = await Steps.create({
      amount: req.body.steps,
      userId: userId,
    });
    return res.redirect('/');
  } catch (error) {
    console.error('Error adding steps:', error);
    return res.status(500).json({ message: 'Internal Server Error adding steps!' });
  }
});

// router.put('/steps/:id', (req, res) => {

// });

router.delete('/steps/:id', async (req, res) => {
  try {
    const deleteSteps = await Steps.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteSteps) {
      res.status(404).json({ message: 'Steps does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteSteps);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//! workout requests

router.get('/workout/:id', async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const dateInput = req.params.id;
    console.log(dateInput);
    console.log(userId);

    const workout = await Workout.findAll({
      where: {
        userId: userId,
        created_at: {
          [Op.between]: [dateInput + ' 00:00:00', dateInput + ' 23:59:59'],
        },
      },
    });

    console.log('Workout data:', workout);

    if (!workout) {
      return res.status(404).send('Workout not found');
    }

    return res.redirect('/');
  } catch (error) {
    console.error('Error processing Workout data:', error);
    res.status(500).send('Error processing Workout data');
  }
});

router.post('/workout', async (req, res) => {
  console.log(req.body);
  const userId = req.session.passport.user;
  try {
    const addWorkout = await Workout.create({
      exercise_name: req.body.exercise,
      reps: req.body.reps,
      sets: req.body.sets,
      weight: req.body.weight,
      userId: userId,
    });
    return res.redirect('/');
  } catch (error) {
    console.error('Error adding Workout:', error);
    return res.status(500).json({ message: 'Internal Server Error adding Workout!' });
  }
});

// router.put('/workout/:id', (req, res) => {

// });

router.delete('/workout/:id', async (req, res) => {
  try {
    const deleteWorkout = await Workout.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteWorkout) {
      res.status(404).json({ message: 'Workout does not exist!' });
      return;
    } else {
      return res.status(200).json(deleteWorkout);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

module.exports = router;
