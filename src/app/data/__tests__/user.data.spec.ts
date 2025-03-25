import { db } from '@/lib/db';
import { success } from '@/logic/result';
import { listUsers, saveUser, filterUsers } from '../user.data';
import { generateMockUser } from '@/mocks/generators/models';
import { userMapper } from '@/app/mappers/user.mapper';

jest.mock('@/lib/db');

describe('User Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUser', () => {
    it('should save a user successfully', async () => {
      const mockUser = generateMockUser();

      (db.one as jest.Mock).mockResolvedValueOnce(
        userMapper.fromModelToEntity(mockUser),
      );

      const result = await saveUser(mockUser);

      expect(result).toEqual(success(mockUser));
      expect(db.one).toHaveBeenCalledTimes(1);
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const mockUsers = [generateMockUser(), generateMockUser()];

      (db.manyOrNone as jest.Mock).mockResolvedValueOnce(
        mockUsers.map(userMapper.fromModelToEntity),
      );

      const result = await listUsers({ page: 1, limit: 10 });

      expect(result).toEqual(success(mockUsers));
      expect(db.manyOrNone).toHaveBeenCalledTimes(1);
    });
  });

  describe('filterUsers', () => {
    it('should filter users by location and languages', async () => {
      const mockUsers = [generateMockUser(), generateMockUser()];

      (db.manyOrNone as jest.Mock).mockResolvedValueOnce(
        mockUsers.map(userMapper.fromModelToEntity),
      );

      const result = await filterUsers({
        page: 1,
        limit: 10,
        location: 'Location 1',
        languages: ['TypeScript'],
      });

      expect(result).toEqual(success(mockUsers));
      expect(db.manyOrNone).toHaveBeenCalledTimes(1);
    });
  });
});
