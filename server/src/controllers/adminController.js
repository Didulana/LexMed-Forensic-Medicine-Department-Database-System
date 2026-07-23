const adminRepo = require('../repositories/adminRepository');

const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    await adminRepo.deactivateUser(req.dbConn, userId);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { user_id, start_date, end_date, limit = 50, offset = 0 } = req.query;
    const filters = {
      userId: user_id,
      startDate: start_date,
      endDate: end_date,
      limit,
      offset
    };
    
    const logs = await adminRepo.getAuditLogs(req.dbConn, filters);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = {
  deactivateUser,
  getAuditLogs
};
