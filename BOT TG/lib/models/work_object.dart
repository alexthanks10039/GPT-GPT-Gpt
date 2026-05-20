enum WorkObjectStatus {
  newObject,
  assigned,
  inProgress,
  review,
  done,
  cancelled,
}

extension WorkObjectStatusLabel on WorkObjectStatus {
  String get label {
    switch (this) {
      case WorkObjectStatus.newObject:
        return 'Новый';
      case WorkObjectStatus.assigned:
        return 'Назначен';
      case WorkObjectStatus.inProgress:
        return 'В работе';
      case WorkObjectStatus.review:
        return 'На проверке';
      case WorkObjectStatus.done:
        return 'Завершён';
      case WorkObjectStatus.cancelled:
        return 'Отменён';
    }
  }
}

class WorkObject {
  const WorkObject({
    required this.id,
    required this.title,
    required this.address,
    required this.clientName,
    required this.phone,
    required this.description,
    required this.deadline,
    required this.status,
    required this.assignee,
    required this.price,
    required this.timeline,
  });

  final String id;
  final String title;
  final String address;
  final String clientName;
  final String phone;
  final String description;
  final DateTime deadline;
  final WorkObjectStatus status;
  final String assignee;
  final int price;
  final List<String> timeline;
}
