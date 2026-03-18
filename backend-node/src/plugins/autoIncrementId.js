const Counter = require("../models/Counter");

const getNextSequenceValue = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  return counter.seq;
};

const assignIdIfMissing = async (doc, sequenceName) => {
  if (doc._id === undefined || doc._id === null) {
    doc._id = await getNextSequenceValue(sequenceName);
  }
};

const autoIncrementId = (schema, options = {}) => {
  const sequenceName = options.sequenceName;

  if (!sequenceName) {
    throw new Error("autoIncrementId plugin requires a sequenceName option");
  }

  schema.pre("validate", async function autoAssignNumericId() {
    if (!this.isNew) {
      return;
    }

    await assignIdIfMissing(this, sequenceName);
  });

  schema.pre("insertMany", async function autoAssignNumericIds(next, docs) {
    try {
      await Promise.all((docs || []).map((doc) => assignIdIfMissing(doc, sequenceName)));
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = autoIncrementId;