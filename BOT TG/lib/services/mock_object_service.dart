import '../models/work_object.dart';

class MockObjectService {
  List<WorkObject> getObjects() {
    return [
      WorkObject(
        id: 'OBJ-001',
        title: 'Квартира ЖК Esentai, 85 м²',
        address: 'Алматы, Бостандыкский район',
        clientName: 'Александр',
        phone: '+7 777 000 00 00',
        description: 'Электромонтаж под ключ: розетки, освещение, щиток.',
        deadline: DateTime(2026, 5, 28),
        status: WorkObjectStatus.inProgress,
        assignee: 'Илья монтажник',
        price: 450000,
        timeline: [
          'Заявка создана с сайта',
          'Объект назначен сотруднику',
          'Работы начаты',
        ],
      ),
      WorkObject(
        id: 'OBJ-002',
        title: 'Офис 120 м²',
        address: 'Алматы, Медеуский район',
        clientName: 'Марина',
        phone: '+7 701 111 22 33',
        description: 'Коммерческая нагрузка, освещение, щитовая.',
        deadline: DateTime(2026, 6, 3),
        status: WorkObjectStatus.assigned,
        assignee: 'Данияр',
        price: 820000,
        timeline: [
          'Заявка создана',
          'Назначен ответственный',
        ],
      ),
      WorkObject(
        id: 'OBJ-003',
        title: 'Дом 180 м²',
        address: 'Алматинская область',
        clientName: 'Руслан',
        phone: '+7 705 222 33 44',
        description: 'Электрика дома, наружный свет, smart-ready.',
        deadline: DateTime(2026, 6, 12),
        status: WorkObjectStatus.review,
        assignee: 'Артём',
        price: 2400000,
        timeline: [
          'Работы начаты',
          'Фото ДО получено',
          'Фото ПОСЛЕ ожидает проверки',
        ],
      ),
    ];
  }
}
