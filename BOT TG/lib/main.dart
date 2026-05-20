import 'package:flutter/material.dart';
import 'models/work_object.dart';
import 'services/mock_object_service.dart';

void main() {
  runApp(const BotTgApp());
}

class BotTgApp extends StatelessWidget {
  const BotTgApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'VoltEdge BOT TG',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF168BFF),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF07090D),
      ),
      home: const ObjectsScreen(),
    );
  }
}

class ObjectsScreen extends StatelessWidget {
  const ObjectsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final objects = MockObjectService().getObjects();

    return Scaffold(
      appBar: AppBar(
        title: const Text('VoltEdge объекты'),
        centerTitle: false,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: objects.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final object = objects[index];
          return ObjectCard(
            object: object,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ObjectDetailsScreen(object: object),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class ObjectCard extends StatelessWidget {
  const ObjectCard({
    required this.object,
    required this.onTap,
    super.key,
  });

  final WorkObject object;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: const Color(0xFF111722),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      object.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                  StatusBadge(status: object.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(object.address),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  InfoChip(label: object.assignee),
                  InfoChip(label: '${object.price} ₸'),
                  InfoChip(label: 'до ${object.deadline.day}.${object.deadline.month}.${object.deadline.year}'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ObjectDetailsScreen extends StatelessWidget {
  const ObjectDetailsScreen({
    required this.object,
    super.key,
  });

  final WorkObject object;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(object.id)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            object.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 12),
          StatusBadge(status: object.status),
          const SizedBox(height: 20),
          DetailBlock(
            title: 'Клиент',
            lines: [object.clientName, object.phone, object.address],
          ),
          DetailBlock(
            title: 'Работы',
            lines: [object.description],
          ),
          DetailBlock(
            title: 'Таймлайн',
            lines: object.timeline,
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.photo_camera_outlined),
            label: const Text('Отправить фотоотчёт'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.edit_note_outlined),
            label: const Text('Добавить комментарий'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Завершить объект'),
          ),
        ],
      ),
    );
  }
}

class DetailBlock extends StatelessWidget {
  const DetailBlock({
    required this.title,
    required this.lines,
    super.key,
  });

  final String title;
  final List<String> lines;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111722),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: const Color(0xFF8BB7FF),
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          ...lines.map(
            (line) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(line),
            ),
          ),
        ],
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({required this.status, super.key});

  final WorkObjectStatus status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF168BFF).withOpacity(0.16),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: const Color(0xFF168BFF).withOpacity(0.38)),
      ),
      child: Text(
        status.label,
        style: const TextStyle(
          color: Color(0xFF8BB7FF),
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

class InfoChip extends StatelessWidget {
  const InfoChip({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12),
      ),
    );
  }
}
